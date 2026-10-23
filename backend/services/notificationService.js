const notificationDefinitions = require("../config/notificationDefinitions");
const notificationRepository = require("../repositories/notificationRepository");

const createFromEvent = async ({
  kullaniciId,
  tip,
  data = {},
  link = null,
  metadata = null,
  transaction = null,
}) => {
  const definition = notificationDefinitions[tip];

  if (!definition) {
    throw new Error(`Tanımsız bildirim tipi: ${tip}`);
  }

  const mesaj =
    typeof definition.mesaj === "function"
      ? definition.mesaj(data)
      : definition.mesaj;

  return notificationRepository.create(
    {
      kullanici_id: kullaniciId,
      tip,
      seviye: definition.seviye,
      konu: definition.konu,
      mesaj,
      link,
      metadata,
    },
    transaction,
  );
};

const getUserNotifications = async (kullaniciId, limit = 20, offset = 0) => {
  return notificationRepository.findByUserId(kullaniciId, limit, offset);
};

const getUnreadCount = async (kullaniciId) => {
  return notificationRepository.countUnreadByUserId(kullaniciId);
};

const markAsRead = async (kullaniciId, bildirimId) => {
  const notification = await notificationRepository.findByIdAndUserId(
    bildirimId,
    kullaniciId,
  );

  if (!notification) {
    return null;
  }

  if (!notification.okunma_tarihi) {
    await notificationRepository.markAsRead(notification);
  }

  return notification;
};

const markAllAsRead = async (kullaniciId) => {
  return notificationRepository.markAllAsRead(kullaniciId);
};

module.exports = {
  createFromEvent,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
