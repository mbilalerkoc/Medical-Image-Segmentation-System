import React from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import styles from "./Sidebar.module.css";
import useNotifications from "../../../hooks/useNotifications";

const Sidebar = () => {
  const { clearUnreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // KULLANICI
  // ==========================================

  let user = {};

  try {
    const userStr =
      localStorage.getItem("user");

    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error(
      "Kullanıcı bilgisi okunamadı:",
      error
    );
  }

  const fullName =
    `${user.ad || ""} ${user.soyad || ""}`.trim() ||
    "Doktor";

  const title =
    user.unvan || "Dr.";

  const initials =
    `${user.ad?.[0] || ""}${
      user.soyad?.[0] || ""
    }`.toUpperCase();

  // ==========================================
  // MENÜ
  // ==========================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },

    {
      name: "Yeni Analiz",
      path: "/analyze",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },

    {
      name: "Hastalarım",
      path: "/patients",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-5a3 3 0 11-6 0 3 3 0 016 0zm6 1a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },

    {
      name: "Randevularım",
      path: "/appointments",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
          />
        </svg>
      ),
    },

    {
      name: "Ayarlar",
      path: "/settings",
      icon: (
        <svg
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // ==========================================
  // ACTIVE MENU
  // ==========================================

  const isMenuActive = (path) => {
    if (path === "/dashboard") {
      return (
        location.pathname ===
        "/dashboard"
      );
    }

    if (path === "/patients") {
      return location.pathname.startsWith(
        "/patients"
      );
    }

    if (path === "/analyze") {
      return (
        location.pathname ===
        "/analyze"
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  // ==========================================
  // ÇIKIŞ
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside
      className={
        styles.sidebar
      }
    >
      {/* LOGO */}

      <div
        className={
          styles.logoSection
        }
      >
        <div
          className={
            styles.logoWrapper
          }
        >
          <div
            className={
              styles.logoImage
            }
          >
            <img
              src="/logo_pathovision.png"
              alt="PathoVision Logo"
            />
          </div>

          <div
            className={
              styles.logoText
            }
          >
            <h1>
              PathoVision
            </h1>

            <p>
              AI Medical Imaging
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}

      <nav
        className={
          styles.navigation
        }
      >
        <p
          className={
            styles.menuTitle
          }
        >
          Menü
        </p>

        <ul
          className={
            styles.menuList
          }
        >
          {menuItems.map(
            (item) => {
              const active =
                isMenuActive(
                  item.path
                );

              return (
                <li
                  key={
                    item.path
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        item.path
                      )
                    }
                    className={`${styles.menuButton} ${
                      active
                        ? styles.menuButtonActive
                        : ""
                    }`}
                  >
                    {active && (
                      <span
                        className={
                          styles.activeLine
                        }
                      />
                    )}

                    <span
                      className={`${styles.menuIcon} ${
                        active
                          ? styles.menuIconActive
                          : ""
                      }`}
                    >
                      {
                        item.icon
                      }
                    </span>

                    <span
                      className={
                        styles.menuText
                      }
                    >
                      {
                        item.name
                      }
                    </span>

                    {active && (
                      <span
                        className={
                          styles.activeDot
                        }
                      />
                    )}
                  </button>
                </li>
              );
            }
          )}
        </ul>
      </nav>

      {/* ALT ALAN */}

      <div
        className={
          styles.bottomSection
        }
      >
        {/* DOKTOR */}

        <div
          className={
            styles.doctorCard
          }
        >
          <div
            className={
              styles.doctorContent
            }
          >
            <div
              className={
                styles.avatar
              }
            >
              {initials ||
                "DR"}
            </div>

            <div
              className={
                styles.doctorInfo
              }
            >
              <p
                className={
                  styles.doctorName
                }
                title={`${title} ${fullName}`}
              >
                {title}{" "}
                {fullName}
              </p>

              <p
                className={
                  styles.doctorEmail
                }
                title={
                  user.email
                }
              >
                {user.email ||
                  "Doktor hesabı"}
              </p>
            </div>
          </div>
        </div>

        {/* ÇIKIŞ */}

        <button
          type="button"
          onClick={
            handleLogout
          }
          className={
            styles.logoutButton
          }
        >
          <svg
            width="20"
            height="20"
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

          <span>
            Çıkış Yap
          </span>
        </button>

        {/* VERSION */}

        <div
          className={
            styles.version
          }
        >
          PathoVision v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;