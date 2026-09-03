    const db = require("../config/database");


const getStatistics = async (
    userId,
    filters = {},
    connection = db
) => {

    const {
        startDate,
        endDate,
    } = filters;

    const whereConditions = [
        "t.user_id = ?"
    ];

    const values = [
        userId
    ];


    if (startDate) {
        whereConditions.push(
            "t.transaction_date >= ?"
        );

        values.push(startDate);
    }


    if (endDate) {
        whereConditions.push(
            "t.transaction_date <= ?"
        );

        values.push(endDate);
    }


    const [rows] = await connection.query(
        `
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN c.type = 'income'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_income,

            COALESCE(
                SUM(
                    CASE
                        WHEN c.type = 'expense'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_expense

        FROM transactions t

        INNER JOIN categories c
            ON t.category_id = c.id

        WHERE ${whereConditions.join(" AND ")}
        `,
        values
    );

    return rows[0];
};


const getBreakdownStatistics = async (
    userId,
    filters = {},
    connection = db
) => {

    const {
        groupBy,
        type,
        categoryId,
        paymentModeId,
        startDate,
        endDate,
        sortBy = "amount",
        order = "DESC"
    } = filters;


    const whereConditions = [
        "t.user_id = ?"
    ];

    const values = [
        userId
    ];


    if (type) {

        whereConditions.push(
            "c.type = ?"
        );

        values.push(type);

    }


    if (categoryId) {

        whereConditions.push(
            "t.category_id = ?"
        );

        values.push(categoryId);

    }


    if (paymentModeId) {

        whereConditions.push(
            "t.payment_mode_id = ?"
        );

        values.push(paymentModeId);

    }


    if (startDate) {

        whereConditions.push(
            "t.transaction_date >= ?"
        );

        values.push(startDate);

    }


    if (endDate) {

        whereConditions.push(
            "t.transaction_date <= ?"
        );

        values.push(endDate);

    }


    let selectFields;
    let groupByClause;
    let allowedSortFields;


    if (groupBy === "category") {

        selectFields = `
            c.id AS category_id,
            c.name AS category_name,

            SUM(t.amount) AS total_amount,

            MAX(
                t.transaction_date
            ) AS latest_transaction_date
        `;

        groupByClause = `
            GROUP BY
                c.id,
                c.name
        `;

        allowedSortFields = {
            amount: "total_amount",
            date: "latest_transaction_date"
        };

    }


    if (groupBy === "paymentMode") {

        selectFields = `
            p.id AS payment_mode_id,
            p.name AS payment_mode_name,

            SUM(t.amount) AS total_amount,

            MAX(
                t.transaction_date
            ) AS latest_transaction_date
        `;

        groupByClause = `
            GROUP BY
                p.id,
                p.name
        `;

        allowedSortFields = {
            amount: "total_amount",
            date: "latest_transaction_date"
        };

    }


    if (groupBy === "date") {

        selectFields = `
            t.transaction_date AS transaction_date,

            COALESCE(
                SUM(
                    CASE
                        WHEN c.type = 'income'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_income,

            COALESCE(
                SUM(
                    CASE
                        WHEN c.type = 'expense'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_expense,

            SUM(t.amount) AS total_amount
        `;

        groupByClause = `
            GROUP BY
                t.transaction_date
        `;

        allowedSortFields = {
            amount: "total_amount",
            date: "t.transaction_date"
        };

    }


    const sortColumn =
        allowedSortFields[sortBy] ||
        allowedSortFields.amount;


    const sortOrder =
        order?.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";


    const [rows] =
        await connection.query(
            `
            SELECT
                ${selectFields}

            FROM transactions t

            INNER JOIN categories c
                ON t.category_id = c.id

            LEFT JOIN payment_modes p
                ON t.payment_mode_id = p.id

            WHERE ${whereConditions.join(" AND ")}

            ${groupByClause}

            ORDER BY
                ${sortColumn}
                ${sortOrder}
            `,
            values
        );


    return rows;

};


module.exports = {
    getStatistics,
    getBreakdownStatistics
};