import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications, NotificationProvider içinde kullanılmalıdır.",
    );
  }

  return context;
};

export default useNotifications;