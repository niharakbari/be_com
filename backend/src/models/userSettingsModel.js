const db = require("../config/database");

const create = async (userId, connection = db) => {

    const [result] = await connection.query(
        `
        INSERT INTO user_settings
        (
            user_id
        )
        VALUES (?)
        `,
        [userId]
    );

    return result.insertId;
};


const findByUserId = async (userId, connection = db) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            user_id,
            budget_mode,
            onboarding_completed,
            created_at,
            updated_at
        FROM user_settings
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );

    return rows[0] || null;
};


const update = async (
    userId,
    updates,
    connection = db
) => {

    const allowedFields = [
        "budget_mode",
        "onboarding_completed"
    ];

    const setters = [];
    const values = [];

    for (const field of allowedFields) {

        if (updates[field] !== undefined) {

            setters.push(`${field} = ?`);
            values.push(updates[field]);

        }

    }

    if (setters.length === 0) {
        return null;
    }

    values.push(userId);

    const [result] = await connection.query(
        `
        UPDATE user_settings
        SET ${setters.join(", ")}
        WHERE user_id = ?
        `,
        values
    );

    return result;
};


module.exports = {
    create,
    findByUserId,
    update
};