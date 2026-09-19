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
const transactionQueryValidation = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().valid("date", "amount", "createdAt").optional(),
    order: Joi.string().valid("ASC", "DESC", "asc", "desc").optional(),
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    categoryId: Joi.number().integer().positive().optional(),
    paymentModeId: Joi.number().integer().positive().optional(),
    type: Joi.string().valid("income", "expense").optional(),
    search: Joi.string().trim().max(100).optional().allow("")
});

module.exports.transactionQueryValidation = transactionQueryValidation;
