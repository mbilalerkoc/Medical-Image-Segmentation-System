const notificationService = require("../services/notificationService");

// BİLDİRİMLERİ GETİR
const getNotifications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const offset = (page - 1) * limit;

        const { count, rows } = await notificationService.getUserNotifications(
            req.user.id,
            limit,
            offset,
        );

        return res.json({
            basarili: true,
            bildirimler: rows,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("Bildirimler alınamadı:", error);

        return res.status(500).json({
            basarili: false,
            mesaj: "Bildirimler alınırken bir hata oluştu.",
        });
    }
};

// OKUNMAMIŞ SAYISI
const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);

        return res.json({
            basarili: true,
            okunmamis: count,
        });
    } catch (error) {
        console.error("Okunmamış bildirim sayısı alınamadı:", error);

        return res.status(500).json({
            basarili: false,
            mesaj: "Okunmamış bildirim sayısı alınamadı.",
        });
    }
};

// TEK BİLDİRİMİ OKUNDU YAP
const markAsRead = async (req, res) => {
    try {
        const bildirimId = Number(req.params.id);

        if (!Number.isInteger(bildirimId) || bildirimId <= 0) {
            return res.status(400).json({
                basarili: false,
                mesaj: "Geçersiz bildirim numarası.",
            });
        }

        const bildirim = await notificationService.markAsRead(
            req.user.id,
            bildirimId,
        );

        if (!bildirim) {
            return res.status(404).json({
                basarili: false,
                mesaj: "Bildirim bulunamadı.",
            });
        }

        return res.json({
            basarili: true,
            bildirim,
        });
    } catch (error) {
        console.error("Bildirim okunamadı:", error);

        return res.status(500).json({
            basarili: false,
            mesaj: "Bildirim güncellenirken bir hata oluştu.",
        });
    }
};

// TÜMÜNÜ OKUNDU YAP
const markAllAsRead = async (req, res) => {
    try {
        const updatedCount = await notificationService.markAllAsRead(req.user.id);

        return res.json({
            basarili: true,
            mesaj: "Tüm bildirimler okundu olarak işaretlendi.",
            guncellenen: updatedCount,
        });
    } catch (error) {
        console.error("Bildirimler güncellenemedi:", error);

        return res.status(500).json({
            basarili: false,
            mesaj: "Bildirimler güncellenirken bir hata oluştu.",
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};