const express = require("express");

const router = express.Router();

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

// GET /api/notifications
router.get("/", getNotifications);

// GET /api/notifications/unread-count
router.get("/unread-count", getUnreadCount);

// PATCH /api/notifications/read-all
router.patch("/read-all", markAllAsRead);

// PATCH /api/notifications/15/read
router.patch("/:id/read", markAsRead);

module.exports = router;