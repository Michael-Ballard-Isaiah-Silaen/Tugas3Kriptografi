import Swal from "sweetalert2";

const handleInvalidState = async () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  await Swal.fire({
    icon: "warning",
    titleText: "Oops..",
    text: "Some fields are not filled correctly, please recheck",
  });
};

export default handleInvalidState;
