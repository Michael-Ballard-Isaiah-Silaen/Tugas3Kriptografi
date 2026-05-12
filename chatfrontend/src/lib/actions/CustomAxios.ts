import axios from "axios";
import {BACKEND_BASE_URL} from "../constant";

const CustomAxios = (
  action: "get" | "post" | "put" | "delete",
  pathUrl: string,
  formData?: unknown,
) => {
  const headers = {
    headers:{
      access_token: localStorage.getItem("access_token") || "",
    },
  };

  if (action === "get" || action === "delete"){
    return axios[action](`${BACKEND_BASE_URL}${pathUrl}`, headers);
  } else{
    return axios[action](`${BACKEND_BASE_URL}${pathUrl}`, formData, headers);
  }
};

export default CustomAxios;
