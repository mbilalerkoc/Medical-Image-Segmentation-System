import React from "react";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../../services/authService";

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

    </header>
  );
};

export default Navbar;
