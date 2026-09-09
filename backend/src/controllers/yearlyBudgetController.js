const yearlyBudgetService =
    require("../services/yearlyBudgetService");


const createBudget = async (
    req,
    res,
    next
) => {

    try {

        const {
            categoryId,
            amount,
            budgetYear
        } = req.body;


        const budget =
            await yearlyBudgetService.createBudget(
                req.user.id,
                categoryId,
                amount,
                budgetYear
            );


        return res.status(201).json({
            success: true,
            message: "Yearly budget created successfully",
            data: budget
        });

    } catch (error) {

        next(error);

    }

};


const getBudgets = async (
    req,
    res,
    next
) => {

    try {

        const budgets =
            await yearlyBudgetService.getBudgets(
                req.user.id,
                req.query.year
            );


        return res.status(200).json({
            success: true,
            data: budgets
        });

    } catch (error) {

        next(error);

    }

};


const getBudgetById = async (
    req,
    res,
    next
) => {

    try {

        const budget =
            await yearlyBudgetService.getBudgetById(
                req.user.id,
                req.params.id
            );


        return res.status(200).json({
            success: true,
            data: budget
        });

    } catch (error) {

        next(error);

    }

};


const updateBudget = async (
    req,
    res,
    next
) => {

    try {

        const budget =
            await yearlyBudgetService.updateBudget(
                req.user.id,
                req.params.id,
                req.body.amount
            );


        return res.status(200).json({
            success: true,
            message: "Yearly budget updated successfully",
            data: budget
        });

    } catch (error) {

        next(error);

    }

};


const deleteBudget = async (
    req,
    res,
    next
) => {

    try {

        await yearlyBudgetService.deleteBudget(
            req.user.id,
            req.params.id
        );


        return res.status(200).json({
            success: true,
            message: "Yearly budget deleted successfully"
        });

    } catch (error) {

        next(error);

    }

};


const getUsage = async (
    req,
    res,
    next
) => {

    try {

        const year =
            req.query.year ||
            new Date().getFullYear();


        const usage =
            await yearlyBudgetService.getUsage(
                req.user.id,
                year
            );


        return res.status(200).json({
            success: true,
            data: usage
        });

    } catch (error) {

        next(error);

    }

};


module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getUsage
};