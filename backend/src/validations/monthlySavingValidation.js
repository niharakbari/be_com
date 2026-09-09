const Joi = require("joi");

const createSavingsSchema = Joi.object({
    savingMonth: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .required(),

    savingYear: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .required(),

    savingsGoal: Joi.number()
        .positive()
        .required()
});

const updateSavingsSchema = Joi.object({
    savingsGoal: Joi.number()
        .positive()
        .required()
});

module.exports = {
    createSavingsSchema,
    updateSavingsSchema
};