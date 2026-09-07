const budgetService = require("../services/budgetService");
const asyncHandler = require("../utils/asyncHandler");


const createBudget = asyncHandler(
    async (req, res) => {

        const budget =
            await budgetService.createBudget(
                req.user.id,
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Budget created successfully",
            data: budget
        });
    }
);


const getBudgets = asyncHandler(
    async (req, res) => {

        const budgets =
            await budgetService.getBudgets(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: budgets
        });
    }
);


const getBudgetById = asyncHandler(
    async (req, res) => {

        const budget =
            await budgetService.getBudgetById(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: budget
        });
    }
);


const updateBudget = asyncHandler(
    async (req, res) => {

        const budget =
            await budgetService.updateBudget(
                req.params.id,
                req.user.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Budget updated successfully",
            data: budget
        });
    }
);


const deleteBudget = asyncHandler(
    async (req, res) => {

        await budgetService.deleteBudget(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Budget deleted successfully"
        });
    }
);

const getBudgetUsage = asyncHandler(
    async (req, res) => {

        const usage =
            await budgetService.getBudgetUsage(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: usage
        });
    }
);


module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetUsage
};