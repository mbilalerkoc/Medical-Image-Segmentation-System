import React, { createContext, useCallback, useMemo, useState } from "react";
import ToastContainer from "../components/toast/ToastContainer";

export const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((prev) => [
      ...prev,
      { id, message, type },
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, duration) => showToast(message, "success", duration),
      error: (message, duration) => showToast(message, "error", duration),
      warning: (message, duration) => showToast(message, "warning", duration),
      info: (message, duration) => showToast(message, "info", duration),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;