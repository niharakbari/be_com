const { idParamValidation } = require("../validations/commonValidation");
const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middlewares/authMiddleware");

const recurringTransactionController =
    require("../controllers/recurringTransactionController");

const { validate } = require("../middlewares/validationMiddleware")
const { createRecurringTransactionValidation, updateRecurringTransactionValidation } 
    = require("../validations/recurringTransactionValidation");


// Create
router.post(
    "/",
    protect,
    validate(createRecurringTransactionValidation),
    recurringTransactionController.createRecurringTransaction
);


// Get all
router.get(
    "/",
    protect,
    recurringTransactionController.getRecurringTransactions
);


// Get one
router.get(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    recurringTransactionController.getRecurringTransactionById
);


// Update
router.patch(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    validate(updateRecurringTransactionValidation, "body"),
    recurringTransactionController.updateRecurringTransaction
);


// Delete
router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    recurringTransactionController.deleteRecurringTransaction
);


// Activate
router.patch(
    "/:id/activate",
    protect,
    validate(idParamValidation, "params"),
    recurringTransactionController.activate
);


// Deactivate
router.patch(
    "/:id/deactivate",
    protect,
    validate(idParamValidation, "params"),
    recurringTransactionController.deactivate
);


module.exports = router;