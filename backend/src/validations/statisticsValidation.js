const Joi = require('joi');

const statisticsQueryValidation = Joi.object({
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
    type: Joi.string().valid("income", "expense").optional(),
    categoryId: Joi.number().integer().positive().optional(),
    paymentModeId: Joi.number().integer().positive().optional(),
    groupBy: Joi.string().valid("category", "paymentMode", "date").optional()
});

module.exports = {
    statisticsQueryValidation
};
