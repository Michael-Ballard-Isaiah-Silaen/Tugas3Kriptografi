import {useState, useContext} from "react";
import InputText from "../components/universal/InputText";
import InputPassword from "../components/universal/InputPassword";
import Button from "../components/universal/Button";
import {NavLink, useNavigate} from "react-router-dom";
import {handleFetchError} from "../lib/actions/HandleError";
import CustomAxios from "../lib/actions/CustomAxios";
import {IUserForm} from "../lib/types/User";
import {CurrentUserContext} from "../lib/contexts/CurrentUserContext";

const toBase64 = (buffer: ArrayBuffer) => window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
const fromBase64 = (base64: string) => Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));
async function decryptUserPrivateKey(password: string, saltB64: string, encryptedKeyJsonStr: string) {
  const enc = new TextEncoder();
  const salt = fromBase64(saltB64);
  const {iv, ciphertext} = JSON.parse(encryptedKeyJsonStr);
  const ivBuffer = fromBase64(iv);
  const ciphertextBuffer = fromBase64(ciphertext);
  const passwordKeyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    {name: "PBKDF2"},
    false,
    ["deriveKey"]
  );
  const derivedAesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKeyMaterial,
    {name: "AES-GCM", length: 256},
    false,
    ["encrypt", "decrypt"]
  );
  const decryptedPrivateKeyBuffer = await window.crypto.subtle.decrypt(
    {name: "AES-GCM", iv: ivBuffer},
    derivedAesKey,
    ciphertextBuffer
  );
  return decryptedPrivateKeyBuffer; 
}

const LoginPage = () => {
  const navigate = useNavigate();
  const currentUserContext = useContext(CurrentUserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUserForm>({
    email: "",
    password: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((oldFd: any) => ({
      ...oldFd,
      [name]: value,
    }));
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try{
      const {data} = await CustomAxios("post", "/auth/login", formData);
      const {access_token, encryptedPrivateKey, salt} = data;
      const decryptedPrivKeyBuffer = await decryptUserPrivateKey(
        formData.password as string, 
        salt, 
        encryptedPrivateKey
      );
      sessionStorage.setItem("decrypted_private_key",toBase64(decryptedPrivKeyBuffer));
      localStorage.setItem("access_token", access_token);
      const userInfoResponse = await CustomAxios("get", "/auth/user-info", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      currentUserContext?.setCurrentUser({
        ...userInfoResponse.data,
        decryptedPrivateKey: decryptedPrivKeyBuffer 
      });
      navigate("/");
    } catch (error){
      handleFetchError(error);
      alert("Login or Decryption failed. Please check your credentials.");
    } finally{
      setIsLoading(false);
    }
  };

  return(
    <div className="flex min-h-screen w-screen items-center justify-center px-4 py-6">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex h-fit w-full max-w-[700px] flex-col gap-4 rounded-lg border-[1px] py-10 shadow-lg md:px-8"
      >
        <h1 className="text-center text-2xl font-bold">Login</h1>
        <h2 className="text-center">Sign in to your account here</h2>
        <InputText
          value={formData.email as string}
          onChange={onChange}
          name="email"
          placeholder="Input your email here"
          required
        />
        <InputPassword
          value={formData.password as string}
          onChange={onChange}
          name="password"
          placeholder="Input your password here"
          required
        />
        <Button disabled={isLoading}>
          {isLoading ? "Decrypting Keys & Logging in..." : "Login"}
        </Button>
        <div className="mx-auto flex gap-2 text-sm">
          <p>Don't have an account?</p>
          <NavLink to="/auth/sign-up" className="text-red-700 duration-300">
            sign up
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;