const { Op } = require("sequelize");
const Notification = require("../models/Notification");

const create = async (data, transaction = null) => {
  return Notification.create(data, {
    transaction,
  });
};

const findByUserId = async (userId, limit = 20, offset = 0) => {
  return Notification.findAndCountAll({
    where: {
      kullanici_id: userId,
    },
    order: [["tarih", "DESC"]],
    limit,
    offset,
  });
};

const countUnreadByUserId = async (userId) => {
  return Notification.count({
    where: {
      kullanici_id: userId,
      okunma_tarihi: null,
    },
  });
};

const findByIdAndUserId = async (notificationId, userId) => {
  return Notification.findOne({
    where: {
      id: notificationId,
      kullanici_id: userId,
    },
  });
};

const markAsRead = async (notification) => {
  notification.okunma_tarihi = new Date();

  return notification.save();
};

const markAllAsRead = async (userId) => {
  const [updatedCount] = await Notification.update(
    {
      okunma_tarihi: new Date(),
    },
    {
      where: {
        kullanici_id: userId,
        okunma_tarihi: null,
      },
    },
  );

  return updatedCount;
};

const findAppointmentReminder = async (userId, appointmentId) => {
  return Notification.findOne({
    where: {
      kullanici_id: userId,
      tip: "appointment_reminder",
      metadata: {
        [Op.contains]: {
          appointment_id: appointmentId,
        },
      },
    },
  });
};

module.exports = {
  create,
  findByUserId,
  countUnreadByUserId,
  findByIdAndUserId,
  markAsRead,
  markAllAsRead,
  findAppointmentReminder,
};
