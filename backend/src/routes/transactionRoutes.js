const express = require("express");

const transactionController = require(
    "../controllers/transactionController"
);

const { protect } = require(
    "../middlewares/authMiddleware"
);

const { validate } = require(
    "../middlewares/validationMiddleware"
);

const {
    createTransactionValidation,
    updateTransactionValidation
} = require(
    "../validations/transactionValidation"
);

const router = express.Router();


router.post(
    "/",
    protect,
    validate(createTransactionValidation),
    transactionController.createTransaction
);


router.get(
    "/",
    protect,
    transactionController.getTransactions
);


router.get(
    "/:id",
    protect,
    transactionController.getTransactionById
);


router.patch(
    "/:id",
    protect,
    validate(updateTransactionValidation),
    transactionController.updateTransaction
);


router.delete(
    "/:id",
    protect,
    transactionController.deleteTransaction
);


module.exports = router;