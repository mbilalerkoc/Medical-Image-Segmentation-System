import React from "react";
import NotificationMenu from "./NotificationMenu";

import styles from "./Navbar.module.css";

const Navbar = ({ title }) => {
  return (
    <header className={styles.navbar}>
      <div className={styles.titleArea}>
        <h1>{title}</h1>
      </div>

      <div className={styles.actions}>
        <NotificationMenu />
      </div>
    </header>
  );
};

export default Navbar;