const transactionService = require(
    "../services/transactionService"
);

const asyncHandler = require(
    "../utils/asyncHandler"
);

const { Parser } = require("json2csv");

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

        const result = await transactionService.getTransactions(req.user.id, req.query);

        res.status(200).json({
            success: true,
            data: result
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


const exportTransactions = async (
    req,
    res,
    next
) => {

    try {
        const transactions =
            await transactionService.exportTransactions(
                req.user.id,
                req.query
            );

        const fields = [
            {
                label: "Transaction ID",
                value: "id"
            },
            {
                label: "Amount",
                value: "amount"
            },
            {
                label: "Date",
                value: "transaction_date"
            },
            {
                label: "Type",
                value: "type"
            },
            {
                label: "Category",
                value: "category_name"
            },
            {
                label: "Payment Mode",
                value: "payment_mode_name"
            },
            {
                label: "Note",
                value: "note"
            }

        ];


        const parser = new Parser({
            fields
        });

        const csv =
            parser.parse(
                transactions
            );

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const fileName =
            `transactions-${today}.csv`;

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        return res
            .status(200)
            .send(csv);

    } catch (error) {

        next(error);

    }

};


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    exportTransactions
};