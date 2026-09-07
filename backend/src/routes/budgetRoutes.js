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


router.get(
    "/:id",
    protect,
    budgetController.getBudgetById
);


router.patch(
    "/:id",
    protect,
    validate(updateBudgetValidation),
    budgetController.updateBudget
);


router.delete(
    "/:id",
    protect,
    budgetController.deleteBudget
);



module.exports = router;