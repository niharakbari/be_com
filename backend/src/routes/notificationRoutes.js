const express = require('express');
const { validate } = require("../middlewares/validationMiddleware");
const { idParamValidation } = require("../validations/commonValidation");

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
    validate(idParamValidation, "params"),
    notificationController.markAsRead
);

router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    notificationController.deleteNotification
);

module.exports = router;