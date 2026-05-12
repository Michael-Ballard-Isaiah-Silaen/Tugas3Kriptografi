import React, {createContext, useState, useEffect, ReactNode} from "react";
import axios from "axios";
import {BACKEND_BASE_URL} from "../constant";
import {IUser} from "../types/User";
import {useNavigate} from "react-router-dom";

export interface CurrentUserContextType{
  currentUser: IUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  fetchUser: (accessToken?: string) => Promise<void>;
}

export const CurrentUserContext = createContext<
  CurrentUserContextType | undefined
>(undefined);

interface CurrentUserProviderProps{
  children: ReactNode;
}

function restorePrivateKey(): ArrayBuffer | undefined{
  const stored = sessionStorage.getItem("decrypted_private_key");
  if (!stored) return undefined;
  try{
    const bytes = Uint8Array.from(window.atob(stored), (c) => c.charCodeAt(0));
    return bytes.buffer;
  } catch{
    sessionStorage.removeItem("decrypted_private_key");
    return undefined;
  }
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const fetchUser = async (accessToken?: string) => {
    try{
      const token = accessToken || localStorage.getItem("access_token");
      if (token) {
        const {data: user} = await axios.get<IUser>(
          BACKEND_BASE_URL + "/auth/user-info",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const decryptedPrivateKey = restorePrivateKey();
        setCurrentUser({...user, decryptedPrivateKey});
      }
    } catch (error){
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("decrypted_private_key");
      navigate("/auth/sign-in");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{currentUser, setCurrentUser, fetchUser}}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};
