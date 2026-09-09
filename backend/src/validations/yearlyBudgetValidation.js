const Joi = require("joi");


const createYearlyBudgetValidation = Joi.object({

    categoryId: Joi
        .number()
        .integer()
        .positive()
        .allow(null),

    amount: Joi
        .number()
        .positive()
        .required(),

    budgetYear: Joi
        .number()
        .integer()
        .min(2000)
        .max(2100)
        .required()

});


const updateYearlyBudgetValidation = Joi.object({

    amount: Joi
        .number()
        .positive()
        .required()

});


module.exports = {
    createYearlyBudgetValidation,
    updateYearlyBudgetValidation
};