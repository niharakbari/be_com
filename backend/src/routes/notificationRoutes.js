const express = require('express');

const router = express.Router();

const { protect } = require("../middlewares/authMiddleware")

const notificationController = require('../controllers/notificationController');


router.get("/", protect, notificationController.getNotifications);

router.get(
    "/unread-count",
    protect,
    notificationController.getUnreadCount
);

router.patch(
    "/read-all",
    protect,
    notificationController.markAllAsRead
);

router.patch(
    "/:id/read",
    protect,
    notificationController.markAsRead
);

router.delete(
    "/:id",
    protect,
    notificationController.deleteNotification
);

module.exports = router;