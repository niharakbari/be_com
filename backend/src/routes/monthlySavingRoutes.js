const express = require("express");

const router = express.Router();

const {protect} = require("../middlewares/authMiddleware");

const monthlySavingController =
    require("../controllers/monthlySavingController");

const { createSavingsSchema, updateSavingsSchema, monthlySavingQueryValidation } = require("../validations/monthlySavingValidation");
const { validate } = require("../middlewares/validationMiddleware");
const { idParamValidation } = require("../validations/commonValidation");



router.post(
    "/",
    protect,
    validate(createSavingsSchema),
    monthlySavingController.createSavingsGoal
);


router.get(
    "/",
    protect,
    validate(monthlySavingQueryValidation, "query"),
    monthlySavingController.getSavings
);


router.patch(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    validate(updateSavingsSchema, "body"),
    monthlySavingController.updateSavingsGoal
);


router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    monthlySavingController.deleteSavingsGoal
);


module.exports = router;