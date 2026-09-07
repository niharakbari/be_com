const transactionModel = require(
    "../models/transactionModel"
);

const categoryModel = require(
    '../models/categoryModel'
);

const paymentModeModel = require(
    '../models/paymentModeModel'
);

const notificationService = 
    require("./notificationService");

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


const createTransaction = async (
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

    await notificationService.generateBudgetNotifications(
        userId
    );

    return await transactionModel.getTransactionById(
        transactionId,
        userId
    );
};



const getTransactions = async (userId, queryParams = {}) => {
    const { startDate, endDate, page, limit } = queryParams;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (startDate) {
        if (!dateRegex.test(startDate) || isNaN(new Date(startDate).getTime())) {
            throw new AppError("Invalid startDate format. Use YYYY-MM-DD", 400);
        }
    }
    
    if (endDate) {
        if (!dateRegex.test(endDate) || isNaN(new Date(endDate).getTime())) {
            throw new AppError("Invalid endDate format. Use YYYY-MM-DD", 400);
        }
        if (startDate && new Date(startDate) > new Date(endDate)) {
            throw new AppError("startDate cannot be greater than endDate", 400);
        }
        queryParams.endDate = endDate + " 23:59:59";
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const validPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const validLimit = !isNaN(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 10;
    
    const offset = (validPage - 1) * validLimit;

    queryParams.page = validPage;
    queryParams.limit = validLimit;
    queryParams.offset = offset;

    const { transactions, totalCount } = await transactionModel.getTransactions(userId, queryParams);
    
    const totalPages = Math.ceil(totalCount / validLimit);

    return {
        transactions,
        pagination: {
            page: validPage,
            limit: validLimit,
            total: totalCount,
            totalPages
        }
    };
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

    await notificationService.generateBudgetNotifications(
        userId
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