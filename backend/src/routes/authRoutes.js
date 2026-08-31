const express = require("express");

const authController = require("../controllers/authController");

const { protect } = require ("../middlewares/authMiddleware")

const { validate } = require("../middlewares/validationMiddleware");

const {registerValidation, 
    loginValidation,
    verifyRegistrationOTPValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} = require("../validations/authValidation");
const { alreadyLoggedIn } = require("../middlewares/alreadyLoggedInMiddleware");

const userController = require('../controllers/userController');


const router = express.Router();



router.post(
    "/register",
    validate(registerValidation),
    authController.register
);


router.post(
    "/login",
    alreadyLoggedIn,
    validate(loginValidation),
    authController.login
);

router.post(
    "/logout",
    authController.logout
);

router.post(
    "/verify-registration-otp",
    validate(verifyRegistrationOTPValidation),
    authController.verifyRegistrationOTP
);

router.get(
    "/me",
    protect,
    userController.getMe
);

router.post(
    "/refresh-token",
    authController.refreshToken
);

router.post(
    "/forgot-password",
    validate(forgotPasswordValidation),
    authController.forgotPassword
);

router.post(
    "/reset-password",
    validate(resetPasswordValidation),
    authController.resetPassword
);


module.exports = router;