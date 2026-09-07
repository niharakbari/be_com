const notificationModel =
    require("../models/notificationModel");

const budgetService =
    require("./budgetService");

const AppError =
    require("../utils/AppError");


const generateBudgetNotifications = async (
    userId
) => {

    const budgets =
        await budgetService.getBudgetUsage(
            userId
        );

    for (const budget of budgets) {

        if (
            budget.status !== "near_limit" &&
            budget.status !== "exceeded"
        ) {
            continue;
        }

        let type;
        let title;
        let message;

        if (budget.status === "near_limit") {

            type = "budget_near_limit";

            title = "Budget nearing limit";

            message =
                `${budget.category_name} budget is ` +
                `${budget.usagePercentage}% used. ` +
                `₹${Math.abs(budget.remaining).toFixed(2)} remaining.`;

        } else {

            type = "budget_exceeded";

            title = "Budget exceeded";

            message =
                `${budget.category_name} budget has been exceeded by ` +
                `₹${Math.abs(budget.remaining).toFixed(2)}.`;
        }

        const existingNotification =
            await notificationModel.findNotification(
                userId,
                type,
                budget.id,
                budget.budget_month,
                budget.budget_year
            );

        if (existingNotification) {
            continue;
        }

        await notificationModel.createNotification(
            userId,
            type,
            title,
            message,
            budget.id,
            budget.budget_month,
            budget.budget_year
        );
    }
};


const getNotifications = async (
    userId
) => {

    return await notificationModel.getNotifications(
        userId
    );
};


const markNotificationAsRead = async (
    notificationId,
    userId
) => {

    const affectedRows =
        await notificationModel.markAsRead(
            notificationId,
            userId
        );

    if (affectedRows === 0) {
        throw new AppError(
            "Notification not found",
            404
        );
    }

    return true;
};


const markAllNotificationsAsRead = async (
    userId
) => {

    await notificationModel.markAllAsRead(
        userId
    );

    return true;
};


const deleteNotification = async (
    notificationId,
    userId
) => {

    const affectedRows =
        await notificationModel.deleteNotification(
            notificationId,
            userId
        );

    if (affectedRows === 0) {
        throw new AppError(
            "Notification not found",
            404
        );
    }

    return true;
};


const getUnreadCount = async (
    userId
) => {

    return await notificationModel.getUnreadCount(
        userId
    );
};


module.exports = {
    generateBudgetNotifications,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount
};