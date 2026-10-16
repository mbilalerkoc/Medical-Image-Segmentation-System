import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import useToast from "../../hooks/useToast";
import styles from "./Notifications.module.css";
import useNotifications from "../../hooks/useNotifications";

const Notifications = () => {
  const { decreaseUnreadCount, clearUnreadCount } = useNotifications();
  const navigate = useNavigate();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getNotifications(page, 10);

      if (!data.basarili) {
        toast.error(data.mesaj || "Bildirimler alınamadı.");
        return;
      }

      setNotifications(data.bildirimler || []);
      setPagination(
        data.pagination || {
          page: 1,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Bildirimler yüklenemedi:", error);
      toast.error(
        error.response?.data?.mesaj ||
          "Bildirimler yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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
              ? {
                  ...item,
                  okunma_tarihi: new Date().toISOString(),
                }
              : item,
          ),
        );

        decreaseUnreadCount();
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Bildirim açılamadı:", error);
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

      toast.success("Tüm bildirimler okundu olarak işaretlendi.");
    } catch (error) {
      console.error("Bildirimler güncellenemedi:", error);
      toast.error(
        error.response?.data?.mesaj ||
          "Bildirimler güncellenirken bir hata oluştu.",
      );
    }
  };

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasUnread = notifications.some(
    (notification) => !notification.okunma_tarihi,
  );

  return (
    <DashboardLayout title="Bildirimler">
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.pageLabel}>Bildirim Merkezi</span>
            <h2>Bildirimler</h2>
            <p>
              Sistem tarafından oluşturulan bildirimlerinizi buradan
              görüntüleyebilirsiniz.
            </p>
          </div>

          {hasUnread && (
            <button
              type="button"
              className={styles.readAllButton}
              onClick={handleMarkAllAsRead}
            >
              Tümünü okundu yap
            </button>
          )}
        </div>

        <div className={styles.card}>
          {loading ? (
            <div className={styles.emptyState}>Bildirimler yükleniyor...</div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✓</div>
              <h3>Bildirim bulunmuyor</h3>
              <p>Henüz görüntülenecek bir bildiriminiz yok.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {notifications.map((notification) => (
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
                    <span className={styles.notificationHeader}>
                      <strong>{notification.konu}</strong>

                      {!notification.okunma_tarihi && (
                        <span className={styles.unreadBadge}>Yeni</span>
                      )}
                    </span>

                    <span className={styles.message}>{notification.mesaj}</span>

                    <span className={styles.date}>
                      {formatDate(notification.tarih)}
                    </span>
                  </span>

                  {notification.link && <span className={styles.arrow}>›</span>}
                </button>
              ))}
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Önceki
              </button>

              <span>
                {page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
