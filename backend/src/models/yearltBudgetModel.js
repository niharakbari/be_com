const db = require("../config/database");


const createBudget = async (
    userId,
    categoryId,
    amount,
    budgetYear,
    connection = db
) => {

    const [result] = await connection.query(
        `
        INSERT INTO yearly_budgets
        (
            user_id,
            category_id,
            amount,
            budget_year
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            categoryId,
            amount,
            budgetYear
        ]
    );

    return result.insertId;
};


const getBudgetsByUser = async (
    userId,
    year = null,
    connection = db
) => {

    let query = `
        SELECT
            yb.id,
            yb.user_id,
            yb.category_id,
            yb.amount,
            yb.budget_year,
            yb.created_at,
            yb.updated_at,
            c.name AS category_name
        FROM yearly_budgets yb
        LEFT JOIN categories c
            ON c.id = yb.category_id
        WHERE yb.user_id = ?
    `;

    const params = [userId];


    if (year !== null && year !== undefined) {

        query += `
            AND yb.budget_year = ?
        `;

        params.push(year);

    }


    query += `
        ORDER BY
            yb.category_id IS NOT NULL,
            yb.category_id
    `;


    const [rows] = await connection.query(
        query,
        params
    );

    return rows;
};


const findBudgetById = async (
    id,
    userId,
    connection = db
) => {

    const [rows] = await connection.query(
        `
        SELECT
            yb.id,
            yb.user_id,
            yb.category_id,
            yb.amount,
            yb.budget_year,
            yb.created_at,
            yb.updated_at,
            c.name AS category_name
        FROM yearly_budgets yb
        LEFT JOIN categories c
            ON c.id = yb.category_id
        WHERE
            yb.id = ?
            AND yb.user_id = ?
        LIMIT 1
        `,
        [
            id,
            userId
        ]
    );

    return rows[0] || null;
};


const updateBudget = async (
    id,
    userId,
    amount,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE yearly_budgets
        SET amount = ?
        WHERE
            id = ?
            AND user_id = ?
        `,
        [
            amount,
            id,
            userId
        ]
    );

    return result;
};


const deleteBudget = async (
    id,
    userId,
    connection = db
) => {

    const [result] = await connection.query(
        `
        DELETE FROM yearly_budgets
        WHERE
            id = ?
            AND user_id = ?
        `,
        [
            id,
            userId
        ]
    );

    return result.affectedRows;
};


const findByUserCategoryYear = async (
    userId,
    categoryId,
    year,
    connection = db
) => {

    let query;

    let params;


    if (categoryId === null) {

        query = `
            SELECT id
            FROM yearly_budgets
            WHERE
                user_id = ?
                AND category_id IS NULL
                AND budget_year = ?
            LIMIT 1
        `;

        params = [
            userId,
            year
        ];

    } else {

        query = `
            SELECT id
            FROM yearly_budgets
            WHERE
                user_id = ?
                AND category_id = ?
                AND budget_year = ?
            LIMIT 1
        `;

        params = [
            userId,
            categoryId,
            year
        ];

    }


    const [rows] = await connection.query(
        query,
        params
    );

    return rows[0] || null;
};


module.exports = {
    createBudget,
    getBudgetsByUser,
    findBudgetById,
    updateBudget,
    deleteBudget,
    findByUserCategoryYear
};