import {AxiosError} from "axios";
import Swal from "sweetalert2";

export const handleFetchError = async (error: unknown) => {
  if (error instanceof AxiosError){
    Swal.fire({
      icon: "error",
      title: "Oopsie...",
      text: error.response?.data,
    });
    return;
  }
  Swal.fire({
    icon: "error",
    title: "Oopsie...",
    text: "Failed to register",
  });
  return;
};
