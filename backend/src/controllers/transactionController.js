const transactionService = require(
    "../services/transactionService"
);

const asyncHandler = require(
    "../utils/asyncHandler"
);


const createTransaction = asyncHandler(
    async (req, res) => {

        const transaction =
            await transactionService.createTransaction(
                req.user.id,
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction
        });
    }
);


const getTransactions = asyncHandler(
    async (req, res) => {

        const transactions = await transactionService.getTransactions(req.user.id, req.query);

        res.status(200).json({
            success: true,
            data: transactions
        });
    }
);


const getTransactionById = asyncHandler(
    async (req, res) => {

        const transaction =
            await transactionService.getTransactionById(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: transaction
        });
    }
);


const updateTransaction = asyncHandler(
    async (req, res) => {

        const transaction =
            await transactionService.updateTransaction(
                req.params.id,
                req.user.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: transaction
        });
    }
);


const deleteTransaction = asyncHandler(
    async (req, res) => {

        await transactionService.deleteTransaction(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });
    }
);


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};