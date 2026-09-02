const db = require("../config/database");


const createTransaction = async (
    userId,
    categoryId,
    paymentModeId,
    amount,
    transactionDate,
    note,
    connection = db
) => {
    const [result] = await connection.query(
        `
        INSERT INTO transactions
        (
            user_id,
            category_id,
            payment_mode_id,
            amount,
            transaction_date,
            note
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            categoryId,
            paymentModeId,
            amount,
            transactionDate,
            note
        ]
    );

    return result.insertId;
};



const getTransactions = async (
    userId,
    queryParams = {},
    connection = db
) => {
    const {
        type,
        categoryId,
        paymentModeId,
        sortBy = "date",
        order = "DESC"
    } = queryParams;

    const whereConditions = ["t.user_id = ?"];
    const values = [userId];

    if (type) {
        whereConditions.push("c.type = ?");
        values.push(type);
    }

    if (categoryId) {
        whereConditions.push("t.category_id = ?");
        values.push(categoryId);
    }

    if (paymentModeId) {
        whereConditions.push("t.payment_mode_id = ?");
        values.push(paymentModeId);
    }

    // Safe sorting
    const allowedSortFields = {
        date: "t.transaction_date",
        amount: "t.amount",
        createdAt: "t.created_at"
    };

    const sortColumn =
        allowedSortFields[sortBy] ||
        allowedSortFields.date;

    const sortOrder =
        order?.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

    const [transactions] = await connection.query(
        `
        SELECT
            t.id,
            c.type,
            t.amount,
            t.transaction_date,
            t.note,

            c.name AS category_name,
            p.name AS payment_mode_name

        FROM transactions t

        LEFT JOIN categories c
            ON t.category_id = c.id

        LEFT JOIN payment_modes p
            ON t.payment_mode_id = p.id

        WHERE ${whereConditions.join(" AND ")}

        ORDER BY ${sortColumn} ${sortOrder}
        `,
        values
    );

    return transactions;
};


const getTransactionById = async (
    transactionId,
    userId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        SELECT
            t.id,
            t.amount,
            t.transaction_date,
            t.note,
            c.id AS category_id,
            c.name AS category_name,
            c.type,
            pm.id AS payment_mode_id,
            pm.name AS payment_mode_name,
            t.created_at,
            t.updated_at
        FROM transactions t
        JOIN categories c
            ON t.category_id = c.id
        JOIN payment_modes pm
            ON t.payment_mode_id = pm.id
        WHERE t.id = ?
        AND t.user_id = ?
        `,
        [transactionId, userId]
    );

    return result[0];
};


const updateTransaction = async (
    transactionId,
    userId,
    categoryId,
    paymentModeId,
    amount,
    transactionDate,
    note,
    connection = db
) => {
    const [result] = await connection.query(
        `
        UPDATE transactions
        SET
            category_id = ?,
            payment_mode_id = ?,
            amount = ?,
            transaction_date = ?,
            note = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [
            categoryId,
            paymentModeId,
            amount,
            transactionDate,
            note,
            transactionId,
            userId
        ]
    );

    return result.affectedRows;
};


const deleteTransaction = async (
    transactionId,
    userId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        DELETE FROM transactions
        WHERE id = ?
        AND user_id = ?
        `,
        [transactionId, userId]
    );

    return result.affectedRows;
};


const sortTransaction = async (
    userId,
    sortParams,
    connection
) => {


    const whereStatement="";

    for (sortParam in sortParams){
        whereStatement.push(`${sortParam} = ?`).join(" AND ")
    }
    whereStatement.push(`AND user_id = ?`)

    const [result] = await connection.query(
        `
        SELECT
            c.name,
            p.name,
            t.amount,
            t.transaction_date,
            t.note
        FROM
            transactions t
            LEFT JOIN categories c
                ON t.category_id=c.id
            LEFT JOIN payment_modes p
                ON t.payment_mode_id=p.id
        WHERE
            ${whereStatement}
        
            

        `,
    )

};


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};