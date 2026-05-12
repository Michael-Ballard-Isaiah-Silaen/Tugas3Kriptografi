import {useContext, useState} from "react";
import InputText from "../components/universal/InputText";
import InputPassword from "../components/universal/InputPassword";
import Button from "../components/universal/Button";
import {NavLink, useNavigate} from "react-router-dom";
import {handleFetchError} from "../lib/actions/HandleError";
import CustomAxios from "../lib/actions/CustomAxios";
import {IUserForm} from "../lib/types/User";
import {CurrentUserContext} from "../lib/contexts/CurrentUserContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const currentUserContext = useContext(CurrentUserContext);
  const [formData, setFormData] = useState<IUserForm>({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData((oldFd) => ({
      ...oldFd,
      [name]: value,
    }));
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const {data} = await CustomAxios("post", "/auth/sign-up", formData);
      const {token, user} = data;
      localStorage.setItem("access_token", token);
      currentUserContext?.setCurrentUser(user);
      navigate("/");
    } catch (error){
      handleFetchError(error);
    }
  };

  return(
    <div className="flex min-h-screen w-screen items-center justify-center px-4 py-6">
      <form
        action="post"
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
        />
        <InputPassword
          value={formData.password as string}
          onChange={onChange}
          name="password"
          placeholder="Input your password here"
        />
        <InputText
          value={formData.firstname as string}
          onChange={onChange}
          name="first_name"
          placeholder="Input your first name"
        />
        <InputText
          value={formData.lastname as string}
          onChange={onChange}
          name="last_name"
          placeholder="Input your last name"
        />
        <Button>Register</Button>
        <div className="mx-auto flex gap-2 text-sm">
          <p>Already have an account?</p>
          <NavLink to="/auth/sign-in" className="text-red-700 duration-300">
            sign in
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;