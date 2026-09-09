const express = require("express");

const router = express.Router();


const { protect } =
    require("../middlewares/authMiddleware");


const { validate } =
    require("../middlewares/validationMiddleware");


const {
    createYearlyBudgetValidation,
    updateYearlyBudgetValidation
} =
    require("../validations/yearlyBudgetValidation");


const yearlyBudgetController =
    require("../controllers/yearlyBudgetController");


router.post(
    "/",
    protect,
    validate(createYearlyBudgetValidation),
    yearlyBudgetController.createBudget
);


router.get(
    "/usage",
    protect,
    yearlyBudgetController.getUsage
);


router.get(
    "/",
    protect,
    yearlyBudgetController.getBudgets
);


router.get(
    "/:id",
    protect,
    yearlyBudgetController.getBudgetById
);


router.patch(
    "/:id",
    protect,
    validate(updateYearlyBudgetValidation),
    yearlyBudgetController.updateBudget
);


router.delete(
    "/:id",
    protect,
    yearlyBudgetController.deleteBudget
);


module.exports = router;