const express = require("express");

const statisticsController = require(
    "../controllers/statisticsController"
);

const {
    protect
} = require(
    "../middlewares/authMiddleware"
);


const { validate } = require("../middlewares/validationMiddleware");
const { statisticsQueryValidation } = require("../validations/statisticsValidation");

const router = express.Router();


router.get(
    "/breakdown",
    protect,
    validate(statisticsQueryValidation, "query"),
    statisticsController.getBreakdownStatistics
);


router.get(
    "/",
    protect,
    validate(statisticsQueryValidation, "query"),
    statisticsController.getStatistics
);


module.exports = router;