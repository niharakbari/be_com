const db = require("../config/database");

const getPaymentModes = async (connection = db) => {
    const [result] = await connection.query(
        `
        SELECT id, name
        FROM payment_modes
        ORDER BY name ASC
        `
    );

    return result;
};

const findPaymentModeById = async (
    paymentModeId,
    connection = db
) => {
    const [result] = await connection.query(
        `
        SELECT id, name
        FROM payment_modes
        WHERE id = ?
        `,
        [paymentModeId]
    );

    return result[0];
};

module.exports = {
    getPaymentModes,
    findPaymentModeById
};