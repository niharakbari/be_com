const express = require("express");

const statisticsController = require(
    "../controllers/statisticsController"
);

const {
    protect
} = require(
    "../middlewares/authMiddleware"
);


const router = express.Router();


router.get(
    "/breakdown",
    protect,
    statisticsController.getBreakdownStatistics
);


router.get(
    "/",
    protect,
    statisticsController.getStatistics
);


module.exports = router;