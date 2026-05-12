import {useContext, useState} from "react";
import InputText from "../components/universal/InputText";
import InputPassword from "../components/universal/InputPassword";
import Button from "../components/universal/Button";
import {NavLink, useNavigate} from "react-router-dom";
import {handleFetchError} from "../lib/actions/HandleError";
import CustomAxios from "../lib/actions/CustomAxios";
import {IUserForm} from "../lib/types/User"; 
import {CurrentUserContext} from "../lib/contexts/CurrentUserContext";

async function generateSecureCredentials(password: string){
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
  const passwordKeyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
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
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  const exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedPrivateKeyBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    derivedAesKey,
    exportedPrivateKey
  );
  const exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const toBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
  return {
    salt: toBase64(salt),
    publicKey: toBase64(exportedPublicKey),
    encryptedPrivateKey: JSON.stringify({
      iv: toBase64(iv),
      ciphertext: toBase64(encryptedPrivateKeyBuffer)
    })
  };
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const currentUserContext = useContext(CurrentUserContext);
  const [formData, setFormData] = useState<Partial<IUserForm> & { username: string }>({
    email: "",
    password: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((oldFd) => ({
      ...oldFd,
      [name]: value,
    }));
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cryptoPayload = await generateSecureCredentials(formData.password as string);
      const finalPayload = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        ...cryptoPayload
      };
      const {data} = await CustomAxios("post", "/auth/register", finalPayload);
      if (data.token){
        localStorage.setItem("access_token", data.token);
        currentUserContext?.setCurrentUser(data.user);
        navigate("/");
      } else{
        navigate("/auth/sign-in"); 
      }
    } catch (error){
      handleFetchError(error);
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center px-4 py-6">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex h-fit w-full max-w-[700px] flex-col gap-4 rounded-lg border-[1px] py-10 shadow-lg md:px-8"
      >
        <h1 className="text-center text-2xl font-bold">Register</h1>
        <h2 className="text-center">Register your account here</h2>
        <InputText
          value={formData.email as string}
          onChange={onChange}
          name="email"
          placeholder="Input your email here"
          required
        />
        <InputText
          value={formData.username as string}
          onChange={onChange}
          name="username"
          placeholder="Input your username here"
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
          {isLoading ? "Generating Keys & Registering..." : "Register"}
        </Button>
        <div className="mx-auto flex gap-2 text-sm">
          <p>Already have an account?</p>
          <NavLink to="/auth/sign-in" className="text-red-700 duration-300">
            Sign in
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;