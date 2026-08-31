const Joi = require("joi");


const updateProfileValidation = Joi.object({

    user_name: Joi
        .string()
        .min(5)
        .max(10)
        .alphanum()
        .messages({
            "string.min":
                "User name must be at least 5 characters",

            "string.max":
                "User name cannot exceed 10 characters",

            "string.alphanum":
                "User name can contain only letters and numbers"
        }),

    mobile_no: Joi
        .string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.pattern.base":
                "Enter a valid 10-digit mobile number"
        })

})
.min(1)
.messages({
    "object.min":
        "At least one field is required"
});


module.exports = {
    updateProfileValidation
};