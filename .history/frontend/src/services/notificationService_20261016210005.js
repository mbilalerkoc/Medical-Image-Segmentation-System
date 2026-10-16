import api from "./api";

// BİLDİRİMLERİ GETİR
export const getNotifications = async (
  page = 1,
  limit = 20
) => {
  const response = await api.get(
    "/notifications",
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
};

// OKUNMAMIŞ BİLDİRİM SAYISINI GETİR
export const getUnreadCount = async () => {
  const response = await api.get(
    "/notifications/unread-count"
  );

  return response.data;
};

// TEK BİLDİRİMİ OKUNDU YAP
export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// TÜM BİLDİRİMLERİ OKUNDU YAP
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};