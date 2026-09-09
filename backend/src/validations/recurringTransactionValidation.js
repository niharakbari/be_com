const Joi = require("joi");


const createRecurringTransactionValidation = Joi.object({

    categoryId: Joi
        .number()
        .integer()
        .positive()
        .required(),

    paymentModeId: Joi
        .number()
        .integer()
        .positive()
        .required(),

    amount: Joi
        .number()
        .positive()
        .required(),

    frequency: Joi
        .string()
        .valid(
            "daily",
            "weekly",
            "monthly",
            "yearly"
        )
        .required(),

    startDate: Joi
        .date()
        .iso()
        .required(),

    note: Joi
        .string()
        .max(500)
        .allow("", null)

});


const updateRecurringTransactionValidation = Joi.object({

    categoryId: Joi
        .number()
        .integer()
        .positive(),

    paymentModeId: Joi
        .number()
        .integer()
        .positive(),

    amount: Joi
        .number()
        .positive(),

    frequency: Joi
        .string()
        .valid(
            "daily",
            "weekly",
            "monthly",
            "yearly"
        ),

    startDate: Joi
        .date()
        .iso(),

    note: Joi
        .string()
        .max(500)
        .allow("", null),

    isActive: Joi
        .boolean()

}).min(1);


module.exports = {
    createRecurringTransactionValidation,
    updateRecurringTransactionValidation
};
