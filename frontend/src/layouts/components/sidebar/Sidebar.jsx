import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import navigationConfig from "../../../config/navigationConfig";
import styles from "./Sidebar.module.css";

const menuIcons = {
  dashboard: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),

  analysis: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v16m8-8H4" />
    </svg>
  ),

  patients: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-5a3 3 0 11-6 0 3 3 0 016 0zm6 1a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),

  appointments: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  ),

  reports: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v6h6M9 13h6M9 17h6" />
    </svg>
  ),

  users: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8-4h5m-2.5-2.5v5" />
    </svg>
  ),

  doctors: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14a5 5 0 100-10 5 5 0 000 10zm-8 7a8 8 0 0116 0M19 3v4m-2-2h4" />
    </svg>
  ),

  clinics: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 21h18M5 21V5h14v16M9 9h6M12 6v6M8 15h2m4 0h2" />
    </svg>
  ),

  settings: (
    <svg width="21" height="21" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    console.error("Kullanıcı bilgisi okunamadı:", error);
  }

  const menuItems = navigationConfig[user.rol] || [];

  const isMenuActive = (path) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
      <div className={styles.logoSection}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoImage}>
            <img src="/logo_pathovision.png" alt="PathoVision Logo" />
          </div>

          <div className={styles.logoText}>
            <h1>PathoVision</h1>
            <p>AI Medical Imaging</p>
          </div>
        </div>
      </div>

      <nav className={styles.navigation}>
        <p className={styles.menuTitle}>Menü</p>

        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            const active = isMenuActive(item.path);

            return (
              <li key={item.path}>
                <button
                  type="button"
                  aria-label={item.name}
                  data-tooltip={item.name}
                  onClick={() => navigate(item.path)}
                  className={`${styles.menuButton} ${active ? styles.menuButtonActive : ""}`}
                >
                  {active && <span className={styles.activeLine} />}

                  <span className={`${styles.menuIcon} ${active ? styles.menuIconActive : ""}`}>
                    {menuIcons[item.icon]}
                  </span>

                  <span className={styles.menuText}>{item.name}</span>

                  {active && <span className={styles.activeDot} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;