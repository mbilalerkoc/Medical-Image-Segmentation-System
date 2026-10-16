import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";
import styles from "./DashboardLayout.module.css";

const DashboardLayout = ({ children, title }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <Navbar title={title} />
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;