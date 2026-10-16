import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../services/notificationService";

import useToast from "../../../hooks/useToast";
import styles from "./NotificationMenu.module.css";
import useNotifications from "../../../hooks/useNotifications";

const NotificationMenu = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const menuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();

      if (data.basarili) {
        setUnreadCount(data.okunmamis || 0);
      }
    } catch (error) {
      console.error("Okunmamış bildirim sayısı alınamadı:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications(1, 8);

      if (!data.basarili) {
        toast.error(data.mesaj || "Bildirimler alınamadı.");
        return;
      }

      setNotifications(data.bildirimler || []);
    } catch (error) {
      console.error("Bildirimler alınamadı:", error);
      toast.error(
        error.response?.data?.mesaj ||
          "Bildirimler yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.okunma_tarihi) {
        const data = await markNotificationAsRead(notification.id);

        if (!data.basarili) {
          toast.error(data.mesaj || "Bildirim güncellenemedi.");
          return;
        }

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, okunma_tarihi: new Date().toISOString() }
              : item,
          ),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      setIsOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Bildirim güncellenemedi:", error);
      toast.error(
        error.response?.data?.mesaj || "Bildirim açılırken bir hata oluştu.",
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const data = await markAllNotificationsAsRead();

      if (!data.basarili) {
        toast.error(data.mesaj || "Bildirimler güncellenemedi.");
        return;
      }

      const readAt = new Date().toISOString();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          okunma_tarihi: notification.okunma_tarihi || readAt,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Bildirimler güncellenemedi:", error);
      toast.error(
        error.response?.data?.mesaj ||
          "Bildirimler güncellenirken bir hata oluştu.",
      );
    }
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Bildirimler"
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <div>
              <h3>Bildirimler</h3>
              <span>
                {unreadCount > 0
                  ? `${unreadCount} okunmamış bildirim`
                  : "Yeni bildiriminiz yok"}
              </span>
            </div>

            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllAsRead}>
                Tümünü okundu yap
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.message}>Bildirimler yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.message}>
                Henüz bir bildiriminiz bulunmuyor.
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`${styles.notification} ${
                    !notification.okunma_tarihi ? styles.unread : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span
                    className={`${styles.indicator} ${
                      styles[notification.seviye] || styles.info
                    }`}
                  />

                  <span className={styles.content}>
                    <strong>{notification.konu}</strong>
                    <span>{notification.mesaj}</span>
                  </span>

                  {!notification.okunma_tarihi && (
                    <span className={styles.unreadDot} />
                  )}
                </button>
              ))
            )}
          </div>
          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
            >
              Tüm Bildirimleri Gör
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
