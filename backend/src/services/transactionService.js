const transactionModel = require(
    "../models/transactionModel"
);

const categoryModel = require(
    '../models/categoryModel'
);

const paymentModeModel = require(
    '../models/paymentModeModel'
);

const AppError = require("../utils/AppError");


const validateCategoryAndPaymentMode = async (
    userId,
    categoryId,
    paymentModeId
) => {

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

    const paymentMode =
        await paymentModeModel.findPaymentModeById(
            paymentModeId
        );

    if (!paymentMode) {
        throw new AppError(
            "Payment mode not found",
            404
        );
    }

    return category;
};


const  createTransaction = async (
    userId,
    transactionData
) => {

    const {
        category_id,
        payment_mode_id,
        amount,
        transaction_date,
        note
    } = transactionData;

    await validateCategoryAndPaymentMode(
        userId,
        category_id,
        payment_mode_id
    );

    const transactionId =
        await transactionModel.createTransaction(
            userId,
            category_id,
            payment_mode_id,
            amount,
            transaction_date,
            note
        );

    return await transactionModel.getTransactionById(
        transactionId,
        userId
    );
};


const getTransactions = async (userId, queryParams = {}) => {
    return await transactionModel.getTransactions(userId, queryParams);
};


const getTransactionById = async (
    transactionId,
    userId
) => {

    const transaction =
        await transactionModel.getTransactionById(
            transactionId,
            userId
        );

    if (!transaction) {
        throw new AppError(
            "Transaction not found",
            404
        );
    }

    return transaction;
};


const updateTransaction = async (
    transactionId,
    userId,
    transactionData
) => {

    const existingTransaction =
        await transactionModel.getTransactionById(
            transactionId,
            userId
        );

    if (!existingTransaction) {
        throw new AppError(
            "Transaction not found",
            404
        );
    }

    // Merge existing values with incoming PATCH values
    const updatedData = {
        category_id:
            transactionData.category_id ??
            existingTransaction.category_id,

        payment_mode_id:
            transactionData.payment_mode_id ??
            existingTransaction.payment_mode_id,

        amount:
            transactionData.amount ??
            existingTransaction.amount,

        transaction_date:
            transactionData.transaction_date ??
            existingTransaction.transaction_date,

        note:
            transactionData.note !== undefined
                ? transactionData.note
                : existingTransaction.note
    };

    await validateCategoryAndPaymentMode(
        userId,
        updatedData.category_id,
        updatedData.payment_mode_id
    );

    await transactionModel.updateTransaction(
        transactionId,
        userId,
        updatedData.category_id,
        updatedData.payment_mode_id,
        updatedData.amount,
        updatedData.transaction_date,
        updatedData.note
    );

    return await transactionModel.getTransactionById(
        transactionId,
        userId
    );
};


const deleteTransaction = async (
    transactionId,
    userId
) => {

    const affectedRows =
        await transactionModel.deleteTransaction(
            transactionId,
            userId
        );

    if (affectedRows === 0) {
        throw new AppError(
            "Transaction not found",
            404
        );
    }
};


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};