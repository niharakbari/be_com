const recurringTransactionService =
    require("../services/recurringTransactionService");

const asyncHandler =
    require("../utils/asyncHandler");


const createRecurringTransaction = asyncHandler(
    async (req, res) => {

        const recurring =
            await recurringTransactionService.createRecurringTransaction(
                req.user.id,
                req.body
            );

        res.status(201).json({
            success: true,
            data: recurring
        });
    }
);


const getRecurringTransactions = asyncHandler(
    async (req, res) => {

        const recurring =
            await recurringTransactionService.getRecurringTransactions(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: recurring
        });
    }
);


const getRecurringTransactionById = asyncHandler(
    async (req, res) => {

        const recurring =
            await recurringTransactionService.getRecurringTransactionById(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: recurring
        });
    }
);


const updateRecurringTransaction = asyncHandler(
    async (req, res) => {

        const recurring =
            await recurringTransactionService.updateRecurringTransaction(
                req.params.id,
                req.user.id,
                req.body
            );

        res.status(200).json({
            success: true,
            data: recurring
        });
    }
);


const deleteRecurringTransaction = asyncHandler(
    async (req, res) => {

        await recurringTransactionService.deleteRecurringTransaction(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Recurring transaction deleted"
        });
    }
);


module.exports = {
    createRecurringTransaction,
    getRecurringTransactions,
    getRecurringTransactionById,
    updateRecurringTransaction,
    deleteRecurringTransaction
};