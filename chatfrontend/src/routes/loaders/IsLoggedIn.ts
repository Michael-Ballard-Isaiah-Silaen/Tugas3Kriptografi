import axios from "axios";
import {redirect} from "react-router-dom";
import Swal from "sweetalert2";
import {BACKEND_BASE_URL} from "../../lib/constant";

const IsLoggedIn = async () => {
  const token = localStorage.getItem("access_token");
  if(!token){
    return redirect("/auth/sign-in"); 
  }
  try{
    const {data: user} = await axios.get(
      `${BACKEND_BASE_URL}/auth/user-info`,
      {
        headers:{
          access_token: token,
        },
      },
    );
    return {user};
  } catch (error){
    localStorage.removeItem("access_token"); 
    await Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please re-login",
    });
    return redirect("/auth/sign-in");
  }
};

export default IsLoggedIn;