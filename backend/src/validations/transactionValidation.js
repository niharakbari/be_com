const Joi = require("joi");

const transactionFields = {
    category_id: Joi.number()
        .integer()
        .positive(),

    payment_mode_id: Joi.number()
        .integer()
        .positive(),

    amount: Joi.number()
        .positive()
        .precision(2)
        .max(999999999999.99),

    transaction_date: Joi.date(),

    note: Joi.string()
        .trim()
        .max(500)
        .allow("", null)
};


const createTransactionValidation = Joi.object({
    ...transactionFields
}).fork(
    [
        "category_id",
        "payment_mode_id",
        "amount",
        "transaction_date"
    ],
    (schema) => schema.required()
);


const updateTransactionValidation = Joi.object({
    ...transactionFields
}).min(1);


module.exports = {
    createTransactionValidation,
    updateTransactionValidation
};