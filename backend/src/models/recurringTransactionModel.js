const db = require("../config/database");


const createRecurringTransaction = async (
    userId,
    data,
    connection = db
) => {

    const [result] = await connection.query(
        `
        INSERT INTO recurring_transactions
        (
            user_id,
            category_id,
            payment_mode_id,
            amount,
            frequency,
            start_date,
            next_occurrence_date,
            note
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            data.category_id,
            data.payment_mode_id,
            data.amount,
            data.frequency,
            data.start_date,
            data.next_occurrence_date,
            data.note
        ]
    );

    return result.insertId;
};


const getRecurringTransactions = async (
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            r.id,
            r.category_id,
            c.name AS category_name,
            r.payment_mode_id,
            p.name AS payment_mode_name,
            r.amount,
            r.frequency,
            r.start_date,
            r.next_occurrence_date,
            r.note,
            r.is_active,
            r.created_at,
            r.updated_at
        FROM recurring_transactions r

        JOIN categories c
            ON r.category_id = c.id

        JOIN payment_modes p
            ON r.payment_mode_id = p.id

        WHERE r.user_id = ?

        ORDER BY r.next_occurrence_date ASC
        `,
        [userId]
    );

    return result;
};


const findRecurringTransactionById = async (
    id,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            r.*,
            c.name AS category_name,
            p.name AS payment_mode_name
        FROM recurring_transactions r
        JOIN categories c
            ON r.category_id = c.id
        JOIN payment_modes p
            ON r.payment_mode_id = p.id
        WHERE r.id = ?
        AND r.user_id = ?
        `,
        [id, userId]
    );

    return result[0];
};


const updateRecurringTransaction = async (
    id,
    userId,
    data,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE recurring_transactions
        SET
            category_id = ?,
            payment_mode_id = ?,
            amount = ?,
            frequency = ?,
            start_date = ?,
            next_occurrence_date = ?,
            note = ?,
            is_active = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [
            data.category_id,
            data.payment_mode_id,
            data.amount,
            data.frequency,
            data.start_date,
            data.next_occurrence_date,
            data.note,
            data.is_active,
            id,
            userId
        ]
    );

    return result.affectedRows;
};


const deleteRecurringTransaction = async (
    id,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        DELETE FROM recurring_transactions
        WHERE id = ?
        AND user_id = ?
        `,
        [id, userId]
    );

    return result.affectedRows;
};


const getDueRecurringTransactions = async (
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT *
        FROM recurring_transactions
        WHERE is_active = TRUE
        AND next_occurrence_date <= CURDATE()
        ORDER BY next_occurrence_date ASC
        `
    );

    return result;
};


const createOccurrence = async (
    recurringTransactionId,
    transactionId,
    occurrenceDate,
    connection = db
) => {

    const [result] = await connection.query(
        `
        INSERT INTO recurring_transaction_occurrences
        (
            recurring_transaction_id,
            transaction_id,
            occurrence_date
        )
        VALUES (?, ?, ?)
        `,
        [
            recurringTransactionId,
            transactionId,
            occurrenceDate
        ]
    );

    return result.insertId;
};


const findOccurrence = async (
    recurringTransactionId,
    occurrenceDate,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT *
        FROM recurring_transaction_occurrences
        WHERE recurring_transaction_id = ?
        AND occurrence_date = ?
        LIMIT 1
        `,
        [
            recurringTransactionId,
            occurrenceDate
        ]
    );

    return result[0];
};


const updateNextOccurrenceDate = async (
    id,
    nextDate,
    isActive,
    connection = db
) => {

    await connection.query(
        `
        UPDATE recurring_transactions
        SET
            next_occurrence_date = ?,
            is_active = ?
        WHERE id = ?
        `,
        [
            nextDate,
            isActive,
            id
        ]
    );
};


module.exports = {
    createRecurringTransaction,
    getRecurringTransactions,
    findRecurringTransactionById,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    getDueRecurringTransactions,
    createOccurrence,
    findOccurrence,
    updateNextOccurrenceDate
};