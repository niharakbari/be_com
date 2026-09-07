const db = require("../config/database");


const createNotification = async (
    userId,
    type,
    title,
    message,
    budgetId,
    budgetMonth,
    budgetYear,
    connection = db
) => {

    const [result] = await connection.query(
        `
        INSERT INTO notifications
        (
            user_id,
            type,
            title,
            message,
            budget_id,
            budget_month,
            budget_year
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            type,
            title,
            message,
            budgetId,
            budgetMonth,
            budgetYear
        ]
    );

    return result.insertId;
};


const findNotification = async (
    userId,
    type,
    budgetId,
    budgetMonth,
    budgetYear,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            id,
            user_id,
            type,
            title,
            message,
            budget_id,
            budget_month,
            budget_year,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = ?
        AND type = ?
        AND budget_id = ?
        AND budget_month = ?
        AND budget_year = ?
        LIMIT 1
        `,
        [
            userId,
            type,
            budgetId,
            budgetMonth,
            budgetYear
        ]
    );

    return result[0];
};


const getNotifications = async (
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            id,
            type,
            title,
            message,
            budget_id,
            budget_month,
            budget_year,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result;
};


const markAsRead = async (
    notificationId,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
        AND user_id = ?
        `,
        [
            notificationId,
            userId
        ]
    );

    return result.affectedRows;
};


const markAllAsRead = async (
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = ?
        AND is_read = FALSE
        `,
        [userId]
    );

    return result.affectedRows;
};


const deleteNotification = async (
    notificationId,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        DELETE FROM notifications
        WHERE id = ?
        AND user_id = ?
        `,
        [
            notificationId,
            userId
        ]
    );

    return result.affectedRows;
};

const getUnreadCount = async (
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT COUNT(*) AS unreadCount
        FROM notifications
        WHERE user_id = ?
        AND is_read = FALSE
        `,
        [userId]
    );

    return Number(result[0].unreadCount);
};


module.exports = {
    createNotification,
    findNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
};