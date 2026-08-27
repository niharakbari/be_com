const Joi = require('joi');

const loginValidation = Joi.object({
    identifier: Joi.alternatives()
        .try(
            Joi.string().email(),
            Joi.string().pattern(/^[0-9]{10}$/)
        )
        .required()
        .messages({
            "alternatives.match": "Enter a valid email or mobile number",
            "any.required": "Email or mobile number is required"
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required"
        })
});


const registerValidation = Joi.object({

    email: Joi
        .string()
        .email()
        .required()
        .messages({
            "string.email": "Enter a valid email address",
            "string.empty": "Email is required",
            "any.required": "Email is required"
        }),

    user_name: Joi
        .string()
        .min(5)
        .max(10)
        .alphanum()
        .required()
        .messages({
            "string.min": "User name must be at least 5 characters",
            "string.max": "User name cannot exceed 10 characters",
            "string.alphanum": "User name can contain only letters and numbers",
            "string.empty": "User name is required",
            "any.required": "User name is required"
        }),

    mobile_no: Joi
        .string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": "Enter a valid 10-digit mobile number",
            "string.empty": "Mobile number is required",
            "any.required": "Mobile number is required"
        })

});

module.exports={
    loginValidation,
    registerValidation
}