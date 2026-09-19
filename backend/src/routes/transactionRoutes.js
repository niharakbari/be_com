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
const { idParamValidation } = require("../validations/commonValidation");

const {
    createTransactionValidation,
    updateTransactionValidation,
    transactionQueryValidation
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
    validate(transactionQueryValidation, "query"),
    transactionController.getTransactions
);

router.get(
    "/export",
    protect,
    validate(transactionQueryValidation, "query"),
    transactionController.exportTransactions
);

router.get(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    transactionController.getTransactionById
);


router.patch(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    validate(updateTransactionValidation, "body"),
    transactionController.updateTransaction
);


router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    transactionController.deleteTransaction
);


module.exports = router;