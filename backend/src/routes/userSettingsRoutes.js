const express = require("express");

const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const { validate } = require("../middlewares/validationMiddleware");

const {
    updateSettingsValidation
} = require("../validations/userSettingValidation");

const userSettingsController =
    require("../controllers/userSettingsController");


router.get(
    "/",
    protect,
    userSettingsController.getSettings
);


router.patch(
    "/",
    protect,
    validate(updateSettingsValidation),
    userSettingsController.updateSettings
);


module.exports = router;