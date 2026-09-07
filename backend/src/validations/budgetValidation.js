const Joi = require("joi");


const budgetFields = {
    category_id: Joi.number()
        .integer()
        .positive()
        .allow(null),

    amount: Joi.number()
        .positive()
        .precision(2)
        .max(999999999999.99),

    budget_month: Joi.number()
        .integer()
        .min(1)
        .max(12),

    budget_year: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
};


const createBudgetValidation = Joi.object({
    ...budgetFields
}).fork(
    [
        "amount",
        "budget_month",
        "budget_year"
    ],
    (schema) => schema.required()
);


const updateBudgetValidation = Joi.object({
    ...budgetFields
}).min(1);


module.exports = {
    createBudgetValidation,
    updateBudgetValidation
};