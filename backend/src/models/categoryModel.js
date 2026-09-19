const db = require("../config/database");

const findCategory = async (
    userId,
    name,
    type,
    connection = db
) => {
    const [result] = await connection.query(
        `
        SELECT id, user_id, name, type
        FROM categories
        WHERE user_id = ?
        AND name = ?
        AND type = ?
        `,
        [userId, name, type]
    );

    return result;
};


const findCategoryById = async (
    categoryId,
    userId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        SELECT id, user_id, name, type
        FROM categories
        WHERE id = ?
        AND user_id = ?
        `,
        [categoryId, userId]
    );

    return result[0];
};


const createCategory = async (
    userId,
    name,
    type,
    connection = db
) => {
    const [result] = await connection.query(
        `
        INSERT INTO categories
        (user_id, name, type)
        VALUES (?, ?, ?)
        `,
        [userId, name, type]
    );

    return result.insertId;
};


const getCategories = async (
    userId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        SELECT id, name, type, created_at, updated_at
        FROM categories
        WHERE user_id = ?
        ORDER BY type ASC, name ASC
        `,
        [userId]
    );

    return result;
};


const findCategoryByIdAndUser = async (
    categoryId,
    userId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        SELECT id, name, type
        FROM categories
        WHERE id = ?
        AND user_id = ?
        `,
        [categoryId, userId]
    );

    return result[0];
};


const updateCategory = async (
    categoryId,
    userId,
    name,
    type,
    connection = db
) => {
    const [result] = await connection.query(
        `
        UPDATE categories
        SET name = ?, type = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [name, type, categoryId, userId]
    );

    return result.affectedRows;
};


const deleteCategory = async (
    categoryId,
    userId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        DELETE FROM categories
        WHERE id = ?
        AND user_id = ?
        `,
        [categoryId, userId]
    );

    return result.affectedRows;
};



const reassignAndDeleteCategory = async (userId, oldCategoryId, newCategoryId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Transactions
        await connection.query(
            "UPDATE transactions SET category_id = ? WHERE user_id = ? AND category_id = ?",
            [newCategoryId, userId, oldCategoryId]
        );

        // 2. Recurring Transactions
        await connection.query(
            "UPDATE recurring_transactions SET category_id = ? WHERE user_id = ? AND category_id = ?",
            [newCategoryId, userId, oldCategoryId]
        );

        // 3. Budgets (resolve UNIQUE conflicts by keeping the new category's existing budget and deleting the old one)
        await connection.query(
            "UPDATE IGNORE budgets SET category_id = ? WHERE user_id = ? AND category_id = ?",
            [newCategoryId, userId, oldCategoryId]
        );
        await connection.query(
            "DELETE FROM budgets WHERE user_id = ? AND category_id = ?",
            [userId, oldCategoryId]
        );

        // 4. Yearly Budgets (resolve UNIQUE conflicts)
        await connection.query(
            "UPDATE IGNORE yearly_budgets SET category_id = ? WHERE user_id = ? AND category_id = ?",
            [newCategoryId, userId, oldCategoryId]
        );
        await connection.query(
            "DELETE FROM yearly_budgets WHERE user_id = ? AND category_id = ?",
            [userId, oldCategoryId]
        );

        // 5. Delete Category
        const [result] = await connection.query(
            "DELETE FROM categories WHERE id = ? AND user_id = ?",
            [oldCategoryId, userId]
        );

        await connection.commit();
        return result.affectedRows;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};


const getCategoryUsage = async (categoryId, userId, connection = db) => {
    const [[trans]] = await connection.query("SELECT COUNT(*) as count FROM transactions WHERE category_id = ? AND user_id = ?", [categoryId, userId]);
    const [[rec]] = await connection.query("SELECT COUNT(*) as count FROM recurring_transactions WHERE category_id = ? AND user_id = ?", [categoryId, userId]);
    const [[bud]] = await connection.query("SELECT COUNT(*) as count FROM budgets WHERE category_id = ? AND user_id = ?", [categoryId, userId]);
    const [[ybud]] = await connection.query("SELECT COUNT(*) as count FROM yearly_budgets WHERE category_id = ? AND user_id = ?", [categoryId, userId]);
    
    return {
        transactions: trans.count,
        recurring_transactions: rec.count,
        budgets: bud.count,
        yearly_budgets: ybud.count,
        total: trans.count + rec.count + bud.count + ybud.count
    };
};

module.exports = {
    getCategoryUsage,
    findCategory,
    findCategoryById,
    createCategory,
    getCategories,
    findCategoryByIdAndUser,
    updateCategory,
    deleteCategory,
    reassignAndDeleteCategory
};