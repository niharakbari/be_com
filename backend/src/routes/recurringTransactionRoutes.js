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
    recurringTransactionController.getRecurringTransactionById
);


// Update
router.patch(
    "/:id",
    protect,
    validate(updateRecurringTransactionValidation),
    recurringTransactionController.updateRecurringTransaction
);


// Delete
router.delete(
    "/:id",
    protect,
    recurringTransactionController.deleteRecurringTransaction
);


// Activate
router.patch(
    "/:id/activate",
    protect,
    recurringTransactionController.activate
);


// Deactivate
router.patch(
    "/:id/deactivate",
    protect,
    recurringTransactionController.deactivate
);


module.exports = router;