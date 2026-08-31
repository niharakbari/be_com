const db = require("../config/database");


const createOTP = async (
    otp,
    connection = db
) => {

    const [result] = await connection.query(
        `
        INSERT INTO verification_otps
        (
            user_id,
            email,
            user_name,
            mobile_no,
            password_hash,
            otp_hash,
            purpose,
            expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            otp.user_id,
            otp.email,
            otp.user_name,
            otp.mobile_no,
            otp.password_hash,
            otp.otp_hash,
            otp.purpose,
            otp.expires_at
        ]
    );

    return result.insertId;
};


const findValidOTP = async (
    email,
    purpose,
    connection = db
) => {

    const [rows] = await connection.query(
        `
        SELECT
            *
        FROM verification_otps
        WHERE
            email = ?
            AND purpose = ?
            AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [
            email,
            purpose
        ]
    );

    return rows[0] || null;
};


const deleteOTP = async (
    id,
    connection = db
) => {

    const [result] = await connection.query(
        `
        DELETE FROM verification_otps
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
};


const deleteExistingOTP = async (
    email,
    purpose,
    connection = db
) => {

    const [result] = await connection.query(
        `
        DELETE FROM verification_otps
        WHERE
            email = ?
            AND purpose = ?
        `,
        [
            email,
            purpose
        ]
    );

    return result.affectedRows;
};


module.exports = {
    createOTP,
    findValidOTP,
    deleteOTP,
    deleteExistingOTP
};