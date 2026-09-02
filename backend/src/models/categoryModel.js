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


module.exports = {
    findCategory,
    findCategoryById,
    createCategory,
    getCategories,
    findCategoryByIdAndUser,
    updateCategory,
    deleteCategory
};