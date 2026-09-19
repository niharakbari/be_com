const { idParamValidation } = require("../validations/commonValidation");
const express = require("express");

const router = express.Router();


const { protect } =
    require("../middlewares/authMiddleware");


const { validate } =
    require("../middlewares/validationMiddleware");


const {
    createYearlyBudgetValidation,
    updateYearlyBudgetValidation,
    yearlyBudgetQueryValidation
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
    validate(yearlyBudgetQueryValidation, "query"),
    yearlyBudgetController.getUsage
);


router.get(
    "/",
    protect,
    validate(yearlyBudgetQueryValidation, "query"),
    protect,
    yearlyBudgetController.getBudgets
);


router.get(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    yearlyBudgetController.getBudgetById
);


router.patch(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    validate(updateYearlyBudgetValidation, "body"),
    yearlyBudgetController.updateBudget
);


router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    yearlyBudgetController.deleteBudget
);


module.exports = router;