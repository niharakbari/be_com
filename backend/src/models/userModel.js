const { Connection } = require('mysql2');
const db = require('../config/database');

const createUser = async (user , connectin = db) => {

    const [result] = await connectin.query(
        `
        INSERT 
        INTO users
        (
            user_name,
            email,
            password_hash,
            mobile_no
        )
        VALUES
        (?, ?, ?, ?)
        `,
        [
            user.user_name,
            user.email,
            user.password_hash,
            user.mobile_no
        ]

    );

    return result.insertId;

};


const updateUser = async (
    user_id,
    updates,
    connection = db
) => {

    const allowedFields = [
        "user_name",
        "mobile_no"
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

    values.push(user_id);

    const [result] = await connection.query(
        `
        UPDATE users
        SET ${setters.join(", ")}
        WHERE id = ?
        `,
        values
    );

    return result;
};


const updateEmail = async (
    userId,
    email,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE users
        SET email = ?
        WHERE id = ?
        `,
        [
            email,
            userId
        ]
    );

    return result;
};


const deleteUser = async(id, connection = db) => {
    `
    DELETE
    FROM users
    WHERE
    id = ? 
    `,
    [id]
};


module.exports = {
    createUser, 
    updateUser,
    updateEmail,
    deleteUser
}