import React from "react";
import styles from "./ToastContainer.module.css";

const icons = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <div className={styles.icon}>{icons[toast.type]}</div>

          <div className={styles.content}>
            <span>{toast.message}</span>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={() => removeToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;