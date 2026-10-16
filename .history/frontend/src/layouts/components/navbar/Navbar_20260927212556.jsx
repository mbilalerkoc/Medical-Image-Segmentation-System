import React from "react";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../services/authService";

import styles from "./Navbar.module.css";

const Navbar = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.titleArea}>
        <h1>{title}</h1>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className={styles.logoutButton}
      >
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>

        <span>Çıkış Yap</span>
      </button>
    </header>
  );
};

export default Navbar;