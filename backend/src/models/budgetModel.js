const db = require("../config/database");


const findBudget = async (
    userId,
    categoryId,
    month,
    year,
    connection = db
) => {

    let query = `
        SELECT
            id,
            user_id,
            category_id,
            amount,
            budget_month,
            budget_year,
            created_at,
            updated_at
        FROM budgets
        WHERE user_id = ?
        AND budget_month = ?
        AND budget_year = ?
    `;

    const values = [
        userId,
        month,
        year
    ];

    if (categoryId === null) {
        query += " AND category_id IS NULL";
    } else {
        query += " AND category_id = ?";
        values.push(categoryId);
    }

    const [result] = await connection.query(
        query,
        values
    );

    return result[0];
};


const createBudget = async (
    userId,
    categoryId,
    amount,
    month,
    year,
    connection = db
) => {

    const [result] = await connection.query(
        `
        INSERT INTO budgets
        (
            user_id,
            category_id,
            amount,
            budget_month,
            budget_year
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            userId,
            categoryId,
            amount,
            month,
            year
        ]
    );

    return result.insertId;
};


const getBudgets = async (
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            b.id,
            b.category_id,
            c.name AS category_name,
            b.amount,
            b.budget_month,
            b.budget_year,
            b.created_at,
            b.updated_at
        FROM budgets b
        LEFT JOIN categories c
            ON b.category_id = c.id
        WHERE b.user_id = ?
        ORDER BY
            b.budget_year DESC,
            b.budget_month DESC,
            c.name ASC
        `,
        [userId]
    );

    return result;
};


const findBudgetById = async (
    budgetId,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            b.id,
            b.user_id,
            b.category_id,
            b.amount,
            b.budget_month,
            b.budget_year,
            c.name AS category_name
        FROM budgets b
        LEFT JOIN categories c
            ON b.category_id = c.id
        WHERE b.id = ?
        AND b.user_id = ?
        `,
        [
            budgetId,
            userId
        ]
    );

    return result[0];
};


const updateBudget = async (
    budgetId,
    userId,
    categoryId,
    amount,
    month,
    year,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE budgets
        SET
            category_id = ?,
            amount = ?,
            budget_month = ?,
            budget_year = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [
            categoryId,
            amount,
            month,
            year,
            budgetId,
            userId
        ]
    );

    return result.affectedRows;
};


const deleteBudget = async (
    budgetId,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        DELETE FROM budgets
        WHERE id = ?
        AND user_id = ?
        `,
        [
            budgetId,
            userId
        ]
    );

    return result.affectedRows;
};


const getBudgetUsage = async (
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            b.id,
            b.category_id,
            c.name AS category_name,
            b.amount,
            b.budget_month,
            b.budget_year,

            COALESCE(
                SUM(
                    CASE
                        WHEN tc.type = 'expense'
                        THEN t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS spent

        FROM budgets b

        LEFT JOIN categories c
            ON b.category_id = c.id

        LEFT JOIN transactions t
            ON t.user_id = b.user_id
            AND (
                b.category_id IS NULL
                OR t.category_id = b.category_id
            )
            AND t.transaction_date >= STR_TO_DATE(
                CONCAT(
                    b.budget_year,
                    '-',
                    LPAD(b.budget_month, 2, '0'),
                    '-01'
                ),
                '%Y-%m-%d'
            )
            AND t.transaction_date < DATE_ADD(
                STR_TO_DATE(
                    CONCAT(
                        b.budget_year,
                        '-',
                        LPAD(b.budget_month, 2, '0'),
                        '-01'
                    ),
                    '%Y-%m-%d'
                ),
                INTERVAL 1 MONTH
            )

        LEFT JOIN categories tc
            ON t.category_id = tc.id

        WHERE b.user_id = ?

        GROUP BY
            b.id,
            b.category_id,
            c.name,
            b.amount,
            b.budget_month,
            b.budget_year

        ORDER BY
            b.budget_year DESC,
            b.budget_month DESC,
            c.name ASC
        `,
        [userId]
    );

    return result;
};


const getBudgetsByMonth = async (
    userId,
    month,
    year,
    connection = db
) => {

    const [result] = await connection.query(
        `
        SELECT
            id,
            category_id,
            amount,
            budget_month,
            budget_year
        FROM budgets
        WHERE user_id = ?
        AND budget_month = ?
        AND budget_year = ?
        ORDER BY category_id IS NOT NULL, category_id
        `,
        [
            userId,
            month,
            year
        ]
    );

    return result;
};

module.exports = {
    findBudget,
    createBudget,
    getBudgets,
    findBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetUsage,
    getBudgetsByMonth
};