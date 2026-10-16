import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getUnreadCount } from "../services/notificationService";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount();

      if (data.basarili) {
        setUnreadCount(data.okunmamis || 0);
      }
    } catch (error) {
      console.error(
        "Okunmamış bildirim sayısı alınamadı:",
        error,
      );
    }
  }, []);

  const decreaseUnreadCount = () => {
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        decreaseUnreadCount,
        clearUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};