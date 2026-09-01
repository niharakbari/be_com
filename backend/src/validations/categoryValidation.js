const Joi = require("joi");


const createCategoryValidation = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    type: Joi.string()
        .valid("income", "expense")
        .required()
});


const updateCategoryValidation = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    type: Joi.string()
        .valid("income", "expense")
        .required()
});


module.exports = {
    createCategoryValidation,
    updateCategoryValidation
};