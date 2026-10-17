import React, { useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";
import styles from "./DashboardLayout.module.css";

const DashboardLayout = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true",
  );

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={sidebarCollapsed} />

      <main className={styles.main}>
        <Navbar
          title={title}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;