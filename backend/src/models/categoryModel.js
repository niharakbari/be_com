const db = require("../config/database");

const findCategory = async (userId, name, type, connection=db) => {

    const [result] = await connection.query(
        `
        SELECT 
            user_id, name, type
        FROM
            categories
        WHERE
            user_id = ? AND name = ? AND type = ?
        `,
        [userId, name, type]
    );

    return result;

};


const createCategory = async (userId, name, type, connection=db) => {
    const [result] = await connection.query(
        `
        INSERT INTO
            categories
        (user_id, name, type)
        VALUES
            (?, ?, ?)
        `,
        [userId, name, type]
    );

    return result.insertId;
};

module.exports = {
    findCategory,
    createCategory
}