const yearlyBudgetModel =
    require("../models/yearltBudgetModel");

const db =
    require("../config/database");

const AppError =
    require("../utils/AppError");


const validateYear = (year) => {

    const numericYear = Number(year);

    if (
        !Number.isInteger(numericYear) ||
        numericYear < 2000 ||
        numericYear > 2100
    ) {

        throw new AppError(
            "Invalid budget year",
            400
        );

    }

    return numericYear;
};


const validateAmount = (amount) => {

    const numericAmount = Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {

        throw new AppError(
            "Budget amount must be greater than 0",
            400
        );

    }

    return numericAmount;
};


const validateCategory = async (
    userId,
    categoryId
) => {

    if (categoryId === null || categoryId === undefined) {
        return;
    }


    const [rows] = await db.query(
        `
        SELECT
            id,
            type
        FROM categories
        WHERE
            id = ?
            AND user_id = ?
        LIMIT 1
        `,
        [
            categoryId,
            userId
        ]
    );


    if (!rows.length) {

        throw new AppError(
            "Category not found",
            404
        );

    }


    if (rows[0].type !== "expense") {

        throw new AppError(
            "Yearly budgets can only use expense categories",
            400
        );

    }

};


const createBudget = async (
    userId,
    categoryId,
    amount,
    budgetYear
) => {

    const year = validateYear(budgetYear);

    const numericAmount =
        validateAmount(amount);


    if (
        categoryId === undefined ||
        categoryId === ""
    ) {

        categoryId = null;

    }


    await validateCategory(
        userId,
        categoryId
    );


    const existing =
        await yearlyBudgetModel.findByUserCategoryYear(
            userId,
            categoryId,
            year
        );


    if (existing) {

        throw new AppError(
            "Yearly budget already exists for this category and year",
            409
        );

    }


    const budgetId =
        await yearlyBudgetModel.createBudget(
            userId,
            categoryId,
            numericAmount,
            year
        );


    return await yearlyBudgetModel.findBudgetById(
        budgetId,
        userId
    );
};


const getBudgets = async (
    userId,
    year
) => {

    if (year !== undefined) {
        year = validateYear(year);
    }


    return await yearlyBudgetModel.getBudgetsByUser(
        userId,
        year
    );
};


const getBudgetById = async (
    userId,
    id
) => {

    const budget =
        await yearlyBudgetModel.findBudgetById(
            id,
            userId
        );


    if (!budget) {

        throw new AppError(
            "Yearly budget not found",
            404
        );

    }


    return budget;
};


const updateBudget = async (
    userId,
    id,
    amount
) => {

    const numericAmount =
        validateAmount(amount);


    const existing =
        await yearlyBudgetModel.findBudgetById(
            id,
            userId
        );


    if (!existing) {

        throw new AppError(
            "Yearly budget not found",
            404
        );

    }


    const result =
        await yearlyBudgetModel.updateBudget(
            id,
            userId,
            numericAmount
        );


    if (!result.affectedRows) {

        throw new AppError(
            "Failed to update yearly budget",
            400
        );

    }


    return await yearlyBudgetModel.findBudgetById(
        id,
        userId
    );
};


const deleteBudget = async (
    userId,
    id
) => {

    const affectedRows =
        await yearlyBudgetModel.deleteBudget(
            id,
            userId
        );


    if (!affectedRows) {

        throw new AppError(
            "Yearly budget not found",
            404
        );

    }


    return true;
};


const getUsage = async (
    userId,
    year
) => {

    const budgetYear =
        validateYear(year);


    const budgets =
        await yearlyBudgetModel.getBudgetsByUser(
            userId,
            budgetYear
        );


    if (!budgets.length) {
        return [];
    }


    const startDate =
        `${budgetYear}-01-01`;

    const endDate =
        `${budgetYear + 1}-01-01`;


    const result = [];


    for (const budget of budgets) {

        let spentQuery = `
            SELECT
                COALESCE(SUM(t.amount), 0)
                AS total_spent
            FROM transactions t
            INNER JOIN categories c
                ON c.id = t.category_id
            WHERE
                t.user_id = ?
                AND c.type = 'expense'
                AND t.transaction_date >= ?
                AND t.transaction_date < ?
        `;


        const params = [
            userId,
            startDate,
            endDate
        ];


        if (budget.category_id !== null) {

            spentQuery += `
                AND t.category_id = ?
            `;

            params.push(
                budget.category_id
            );

        }


        const [spentResult] =
            await db.query(
                spentQuery,
                params
            );


        const amount =
            Number(budget.amount);

        const spent =
            Number(
                spentResult[0].total_spent
            );


        const remaining =
            Math.max(
                0,
                amount - spent
            );


        const usagePercentage =
            amount > 0
                ? Number(
                    (
                        (spent / amount) * 100
                    ).toFixed(2)
                )
                : 0;


        let status = "normal";


        if (usagePercentage >= 100) {

            status = "exceeded";

        } else if (
            usagePercentage >= 80
        ) {

            status = "near_limit";

        }


        result.push({
            id: budget.id,
            category_id: budget.category_id,
            category_name: budget.category_name,
            amount,
            spent,
            remaining,
            usagePercentage,
            status,
            budget_year: budget.budget_year
        });

    }


    return result;
};


module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getUsage
};