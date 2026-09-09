const express = require("express");

const router = express.Router();

const {protect} = require("../middlewares/authMiddleware");

const monthlySavingController =
    require("../controllers/monthlySavingController");

const { createSavingsSchema, updateSavingsSchema } = require("../validations/monthlySavingValidation");
const { validate } = require("../middlewares/validationMiddleware");



router.post(
    "/",
    protect,
    monthlySavingController.createSavingsGoal
);


router.get(
    "/",
    protect,
    monthlySavingController.getSavings
);


router.patch(
    "/:id",
    protect,
    validate(updateSavingsSchema),
    monthlySavingController.updateSavingsGoal
);


router.delete(
    "/:id",
    protect,
    monthlySavingController.deleteSavingsGoal
);


module.exports = router;