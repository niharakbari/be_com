const paymentModeModel = require("../models/paymentModeModel");

const getPaymentModes = async () => {
    return await paymentModeModel.getPaymentModes();
};

module.exports = {
    getPaymentModes
};