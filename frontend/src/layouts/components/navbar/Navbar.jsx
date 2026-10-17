import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationMenu from "./NotificationMenu";
import useNotifications from "../../../hooks/useNotifications";
import { getProfilePhotoUrl } from "../../../services/settingsService";
import styles from "./Navbar.module.css";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    console.error("Kullanıcı bilgisi okunamadı:", error);

    return {};
  }
};

const Navbar = ({ title, sidebarCollapsed, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { clearUnreadCount } = useNotifications();

  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState(getStoredUser);

  /* KULLANICI DEĞİŞİKLİKLERİNİ DİNLE */
  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("userUpdated", syncUser);

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userUpdated", syncUser);

      window.removeEventListener("storage", syncUser);
    };
  }, []);

  /* DIŞARI TIKLAMA */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fullName = `${user.ad || ""} ${user.soyad || ""}`.trim() || "Doktor";

  const doctorTitle = user.unvan || "Dr.";

  const initials =
    `${user.ad?.[0] || ""}${user.soyad?.[0] || ""}`.toUpperCase() || "DR";

  const clinicName = user.klinik_adi || "Doktor hesabı";

  const profilePhoto = getProfilePhotoUrl(user.profil_resmi);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    clearUnreadCount();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className={styles.titleArea}>
          <h1>{title}</h1>
        </div>
      </div>

      <div className={styles.actions}>
        <NotificationMenu />

        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className={styles.avatar}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={`${fullName} profil`}
                  className={styles.avatarImage}
                />
              ) : (
                initials
              )}
            </span>

            <span className={styles.profileMeta}>
              <strong>
                {doctorTitle} {fullName}
              </strong>

              <small>{clinicName}</small>
            </span>

            <svg
              className={`${styles.chevron} ${
                profileOpen ? styles.chevronOpen : ""
              }`}
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <span className={styles.dropdownAvatar}>
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={`${fullName} profil`}
                      className={styles.avatarImage}
                    />
                  ) : (
                    initials
                  )}
                </span>

                <div>
                  <strong>
                    {doctorTitle} {fullName}
                  </strong>

                  <span>{user.email || "Doktor hesabı"}</span>
                </div>
              </div>

              <div className={styles.profileDivider} />

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
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
                    d="M12 15.5A3.5 3.5 0 1012 8a3.5 3.5 0 000 7.5zm7.4-3.5a7.7 7.7 0 00-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 00-1.7-1L15 3.5h-4L10.6 6a8 8 0 00-1.7 1L6.5 6l-2 3.5 2 1.5a7.7 7.7 0 000 2L4.5 14.5l2 3.5 2.4-1a8 8 0 001.7 1l.4 2.5h4l.4-2.5a8 8 0 001.7-1l2.4 1 2-3.5-2.1-1.5c.1-.3.1-.7 0-1z"
                  />
                </svg>
                Ayarlar
              </button>

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
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
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
