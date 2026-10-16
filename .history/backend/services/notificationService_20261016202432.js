const Notification = require("../models/Notification");
const notificationDefinitions = require("../config/notificationDefinitions");

// BİLDİRİM OLUŞTUR
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

    return Notification.create(
        {
            kullanici_id: kullaniciId,
            tip,
            seviye: definition.seviye,
            konu: definition.konu,
            mesaj,
            link,
            metadata,
        },
        { transaction },
    );
};

// KULLANICININ BİLDİRİMLERİNİ GETİR
const getUserNotifications = async (kullaniciId, limit = 20, offset = 0) => {
    return Notification.findAndCountAll({
        where: { kullanici_id: kullaniciId },
        order: [["tarih", "DESC"]],
        limit,
        offset,
    });
};

// OKUNMAMIŞ BİLDİRİM SAYISI
const getUnreadCount = async (kullaniciId) => {
    return Notification.count({
        where: {
            kullanici_id: kullaniciId,
            okunma_tarihi: null,
        },
    });
};

// TEK BİLDİRİMİ OKUNDU YAP
const markAsRead = async (kullaniciId, bildirimId) => {
    const notification = await Notification.findOne({
        where: {
            id: bildirimId,
            kullanici_id: kullaniciId,
        },
    });

    if (!notification) return null;

    if (!notification.okunma_tarihi) {
        notification.okunma_tarihi = new Date();
        await notification.save();
    }

    return notification;
};

// TÜM BİLDİRİMLERİ OKUNDU YAP
const markAllAsRead = async (kullaniciId) => {
    const [updatedCount] = await Notification.update(
        { okunma_tarihi: new Date() },
        {
            where: {
                kullanici_id: kullaniciId,
                okunma_tarihi: null,
            },
        },
    );

    return updatedCount;
};

module.exports = {
    createFromEvent,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};