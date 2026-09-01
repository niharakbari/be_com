const paymentModeService = require(
    "../services/paymentModeService"
);

const logger = require("../config/logger");

const getPaymentModes = async (req, res, next) => {
    try {
        const paymentModes =
            await paymentModeService.getPaymentModes();

        return res.status(200).json({
            success: true,
            data: paymentModes
        });

    } catch (err) {
        logger.error(err.message);
        next(err);
    }
};

module.exports = {
    getPaymentModes
};