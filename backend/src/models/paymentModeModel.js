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

module.exports = {
    getPaymentModes
};