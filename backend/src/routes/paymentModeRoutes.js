const express = require("express");

const paymentModeController = require(
    "../controllers/paymentModeController"
);

const { protect } = require(
    "../middlewares/authMiddleware"
);

const router = express.Router();

router.get(
    "/",
    protect,
    paymentModeController.getPaymentModes
);

module.exports = router;