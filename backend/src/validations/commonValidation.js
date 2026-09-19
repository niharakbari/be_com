const Joi = require('joi');

const idParamValidation = Joi.object({
    id: Joi.number().integer().positive().required()
});

module.exports = {
    idParamValidation
};
