const { Resend } = require ('resend');
const config = require(`../config/config`)

const resend = new Resend(config.resend.api);

const forgotPasswordTemplate = require("../templates/forgotPasswordTemplate");
const registrationOTPTemplate = require("../templates/registrationOtpTemplate");

const logger = require('../config/logger');

const sendForgotPasswordMail = async (otp, email = "rajrajpara701@gmail.com") => {

    try { 
        
        await resend.emails.send({
            from: 'onboarding@resend.dev',
             to: `${email}`,
             subject: 'Forgot Password request - BeCom',
             html: forgotPasswordTemplate(otp)
        });

    } catch(err) {
        logger.error(`Failed to send forgot password email: ${err.message}`);

        throw err;
    }

};

const sendRegistrationOtpMail = async (
    otp,
    email = "rajrajpara701@gmail.com"
) => {

    try {

        await resend.emails.send({
            from: "onboarding@resend.dev",

            to: email,

            subject: "Verify Your Email - BeCom",

            html: registrationOTPTemplate(otp)
        });

    } catch (err) {

        logger.error(
            `Failed to send registration OTP email: ${err.message}`
        );

        throw err;

    }

};




module.exports = {
    sendForgotPasswordMail,
    sendRegistrationOtpMail
};


