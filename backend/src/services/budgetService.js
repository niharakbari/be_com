const budgetModel = require("../models/budgetModel");
const categoryModel = require("../models/categoryModel");
const AppError = require("../utils/AppError");


const validateBudgetData = (
    amount,
    month,
    year
) => {

    if (
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        throw new AppError(
            "Budget amount must be greater than 0",
            400
        );
    }

    if (
        !Number.isInteger(Number(month)) ||
        Number(month) < 1 ||
        Number(month) > 12
    ) {
        throw new AppError(
            "Budget month must be between 1 and 12",
            400
        );
    }

    if (
        !Number.isInteger(Number(year)) ||
        Number(year) < 2000 ||
        Number(year) > 2100
    ) {
        throw new AppError(
            "Invalid budget year",
            400
        );
    }
};


const validateCategory = async (
    userId,
    categoryId
) => {

    if (categoryId === null) {
        return;
    }

    const category =
        await categoryModel.findCategoryByIdAndUser(
            categoryId,
            userId
        );

    if (!category) {
        throw new AppError(
            "Category not found",
            404
        );
    }

    if (category.type !== "expense") {
        throw new AppError(
            "You can not set budget limit on incomes",
            400
        );
    }
};


const createBudget = async (
    userId,
    budgetData
) => {

    const {
        category_id = null,
        amount,
        budget_month,
        budget_year
    } = budgetData;

    validateBudgetData(
        amount,
        budget_month,
        budget_year
    );

    await validateCategory(
        userId,
        category_id
    );

    const existingBudget =
        await budgetModel.findBudget(
            userId,
            category_id,
            budget_month,
            budget_year
        );

    if (existingBudget) {
        throw new AppError(
            "Budget already exists for this period",
            409
        );
    }

    const budgetId =
        await budgetModel.createBudget(
            userId,
            category_id,
            amount,
            budget_month,
            budget_year
        );

    return await budgetModel.findBudgetById(
        budgetId,
        userId
    );
};


const getBudgets = async (
    userId
) => {

    return await budgetModel.getBudgets(
        userId
    );
};


const getBudgetById = async (
    budgetId,
    userId
) => {

    const budget =
        await budgetModel.findBudgetById(
            budgetId,
            userId
        );

    if (!budget) {
        throw new AppError(
            "Budget not found",
            404
        );
    }

    return budget;
};


const updateBudget = async (
    budgetId,
    userId,
    budgetData
) => {

    const existingBudget =
        await budgetModel.findBudgetById(
            budgetId,
            userId
        );

    if (!existingBudget) {
        throw new AppError(
            "Budget not found",
            404
        );
    }

    const updatedData = {

        category_id:
            budgetData.category_id !== undefined
                ? budgetData.category_id
                : existingBudget.category_id,

        amount:
            budgetData.amount !== undefined
                ? budgetData.amount
                : existingBudget.amount,

        budget_month:
            budgetData.budget_month !== undefined
                ? budgetData.budget_month
                : existingBudget.budget_month,

        budget_year:
            budgetData.budget_year !== undefined
                ? budgetData.budget_year
                : existingBudget.budget_year
    };

    validateBudgetData(
        updatedData.amount,
        updatedData.budget_month,
        updatedData.budget_year
    );

    await validateCategory(
        userId,
        updatedData.category_id
    );

    const duplicateBudget =
        await budgetModel.findBudget(
            userId,
            updatedData.category_id,
            updatedData.budget_month,
            updatedData.budget_year
        );

    if (
        duplicateBudget &&
        duplicateBudget.id !== Number(budgetId)
    ) {
        throw new AppError(
            "Budget already exists for this period",
            409
        );
    }

    await budgetModel.updateBudget(
        budgetId,
        userId,
        updatedData.category_id,
        updatedData.amount,
        updatedData.budget_month,
        updatedData.budget_year
    );

    return await budgetModel.findBudgetById(
        budgetId,
        userId
    );
};


const deleteBudget = async (
    budgetId,
    userId
) => {

    const affectedRows =
        await budgetModel.deleteBudget(
            budgetId,
            userId
        );

    if (affectedRows === 0) {
        throw new AppError(
            "Budget not found",
            404
        );
    }

    return true;
};

const getBudgetUsage = async (
    userId
) => {

    const budgets =
        await budgetModel.getBudgetUsage(
            userId
        );

    return budgets.map((budget) => {

        const amount = Number(budget.amount);
        const spent = Number(budget.spent);

        const remaining =
            amount - spent;

        const usagePercentage =
            amount > 0
                ? (spent / amount) * 100
                : 0;

        let status = "normal";

        if (usagePercentage >= 100) {
            status = "exceeded";
        } else if (usagePercentage >= 80) {
            status = "near_limit";
        }

        return {
            id: budget.id,
            category_id: budget.category_id,
            category_name:
                budget.category_name || "Overall",
            amount,
            spent,
            remaining,
            usagePercentage:
                Number(usagePercentage.toFixed(2)),
            status,
            budget_month: budget.budget_month,
            budget_year: budget.budget_year
        };
    });
};


const cloneBudgets = async (
    userId,
    sourceMonth,
    sourceYear,
    targetMonth,
    targetYear
) => {

    if (
        sourceMonth === targetMonth &&
        sourceYear === targetYear
    ) {
        throw new AppError(
            "Source and target month cannot be the same",
            400
        );
    }

    validateBudgetData(
        1,
        sourceMonth,
        sourceYear
    );

    validateBudgetData(
        1,
        targetMonth,
        targetYear
    );

    const sourceBudgets =
        await budgetModel.getBudgetsByMonth(
            userId,
            sourceMonth,
            sourceYear
        );

    if (!sourceBudgets.length) {
        throw new AppError(
            "No budgets found for the source month",
            404
        );
    }

    const targetBudgets =
        await budgetModel.getBudgetsByMonth(
            userId,
            targetMonth,
            targetYear
        );

    if (targetBudgets.length) {
        throw new AppError(
            "Budgets already exist for the target month",
            409
        );
    }

    const clonedBudgets = [];

    for (const budget of sourceBudgets) {

        const budgetId =
            await budgetModel.createBudget(
                userId,
                budget.category_id,
                budget.amount,
                targetMonth,
                targetYear
            );

        clonedBudgets.push(
            await budgetModel.findBudgetById(
                budgetId,
                userId
            )
        );
    }

    return clonedBudgets;
};


module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetUsage,
    cloneBudgets
};