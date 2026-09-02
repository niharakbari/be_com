    const db = require("../config/database");


const getStatistics = async (
    userId,
    filters = {},
    connection = db
) => {

    const {
        startDate,
        endDate
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


module.exports = {
    getStatistics
};