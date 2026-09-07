const notificationService =
    require("../services/notificationService");

const asyncHandler =
    require("../utils/asyncHandler");


const getNotifications = asyncHandler(
    async (req, res) => {

        const notifications =
            await notificationService.getNotifications(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: notifications
        });
    }
);


const markAsRead = asyncHandler(
    async (req, res) => {

        await notificationService.markNotificationAsRead(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    }
);


const markAllAsRead = asyncHandler(
    async (req, res) => {

        await notificationService.markAllNotificationsAsRead(
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    }
);


const deleteNotification = asyncHandler(
    async (req, res) => {

        await notificationService.deleteNotification(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    }
);

const getUnreadCount = asyncHandler(
    async (req, res) => {

        const unreadCount =
            await notificationService.getUnreadCount(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: {
                unreadCount
            }
        });
    }
);


module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
};