const Joi = require("joi");
const { isValidLocalDateTime } = require("../utils/date");

const localDateTime = Joi.string().custom((value, helpers) => {
    if (!isValidLocalDateTime(value)) {
        return helpers.error("date.localDateTime");
    }

    return value;
}).messages({
    "date.localDateTime": "{{#label}} must be a valid local datetime in YYYY-MM-DDTHH:mm format"
});

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

    transaction_date: localDateTime,

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