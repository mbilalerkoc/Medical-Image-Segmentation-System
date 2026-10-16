import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

const useToast = () => {
  const toast = useContext(ToastContext);

  if (!toast) {
    throw new Error("useToast, ToastProvider içerisinde kullanılmalıdır.");
  }

  return toast;
};

export default useToast;