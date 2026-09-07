const express = require("express");

const router = express.Router();

const { protect } =
    require("../middlewares/authMiddleware");

const recurringTransactionController =
    require("../controllers/recurringTransactionController");


router.post(
    "/",
    protect,
    recurringTransactionController.createRecurringTransaction
);

router.get(
    "/",
    protect,
    recurringTransactionController.getRecurringTransactions
);

router.get(
    "/:id",
    protect,
    recurringTransactionController.getRecurringTransactionById
);

router.patch(
    "/:id",
    protect,
    recurringTransactionController.updateRecurringTransaction
);

router.delete(
    "/:id",
    protect,
    recurringTransactionController.deleteRecurringTransaction
);


module.exports = router;