const { idParamValidation } = require("../validations/commonValidation");
const express = require("express");

const budgetController = require(
    "../controllers/budgetController"
);

const { protect } = require(
    "../middlewares/authMiddleware"
);

const {
    createBudgetValidation,
    updateBudgetValidation
} = require(
    "../validations/budgetValidation"
);

const { validate } = require(
    "../middlewares/validationMiddleware"
);


const router = express.Router();


router.post(
    "/",
    protect,
    validate(createBudgetValidation),
    budgetController.createBudget
);


router.get(
    "/",
    protect,
    budgetController.getBudgets
);


router.get("/usage",
    protect,
    budgetController.getBudgetUsage
);


router.post(
    "/clone",
    protect,
    budgetController.cloneBudgets
);


router.get(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    budgetController.getBudgetById
);


router.patch(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    validate(updateBudgetValidation, "body"),
    budgetController.updateBudget
);


router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    budgetController.deleteBudget
);




module.exports = router;