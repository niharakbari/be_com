const db = require('../config/database');

const createUser = async (user , connection = db) => {

    const [result] = await connection.query(
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
    userId,
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


    values.push(userId);


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


const deleteUser = async (id, connection = db) => {

    const [result] = await connection.query(
        `
        DELETE
        FROM users
        WHERE
        id = ? 
        `,
        [id]
    );

    return result.affectedRows;

};

const findByEmail = async (email, connection = db) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            user_name,
            email,
            mobile_no,
            password_hash
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;
};


const findByMobile = async (mobile, connection = db) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            user_name,
            email,
            mobile_no,
            password_hash
        FROM users
        WHERE mobile_no = ?
        LIMIT 1
        `,
        [mobile]
    );

    return rows[0] || null;
};

const findById = async (id , connection = db) => {
    
    const [result] = await connection.query(
        `
        SELECT
            id,
            user_name,
            email,
            mobile_no,
            created_at,
            updated_at
        FROM    
            users
        WHERE
            id = ?
        `,
        [id]
    );

    return result[0] || null;
}


const findByIdentifier = async (
    identifier,
    connection = db
) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            user_name,
            email,
            mobile_no,
            password_hash
        FROM users
        WHERE 
            email = ? OR mobile_no = ?
        LIMIT 1
        `,
        [
            identifier,
            identifier
        ]
    );

    return rows[0] || null;
};

const findPasswordUserByEmail = async (
    email,
    connection = db
) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            email,
            password_hash
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;

};


const updatePassword = async (
    userId,
    passwordHash,
    connection = db
) => {

    const [result] = await connection.query(
        `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
        `,
        [
            passwordHash,
            userId
        ]
    );

    return result;

};

module.exports = {
    createUser, 
    updateUser,
    updateEmail,
    deleteUser,
    findByEmail,
    findByMobile,
    findById,
    findByIdentifier,
    findPasswordUserByEmail,
    updatePassword
}