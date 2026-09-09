const Joi = require("joi");


const updateSettingsValidation = Joi.object({

    budget_mode: Joi
        .string()
        .valid("monthly", "yearly"),

    onboarding_completed: Joi
        .boolean()

}).min(1);


module.exports = {
    updateSettingsValidation
};