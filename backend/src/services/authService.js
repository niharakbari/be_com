const db = require("../config/database");

const userModel = require('../models/userModel');
const otpModel = require("../models/otpModel");

const mailService = require('../services/mailService');

const bcrypt = require("bcrypt");

const { generateOTP } = require("../utils/otp");

const config = require("../config/config");

const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require("../utils/jwt");

const refreshTokenModel = require(
    "../models/refreshTokenModel"
);




const register = async (userData) => {

    const existingEmail = await userModel.findByEmail(
        userData.email
    );

    if (existingEmail) {
        const error = new Error("Email already registered");
        error.statusCode = 409;

        throw error;
    }


    const existingMobile = await userModel.findByMobile(
        userData.mobile_no
    );

    if (existingMobile) {
        const error = new Error(
            "Mobile number already registered"
        );

        error.statusCode = 409;

        throw error;
    }


    const password_hash = await bcrypt.hash(
        userData.password,
        config.bcryptSaltRounds
    );


    const otp = generateOTP();

    console.log("`otp: ${otp");

    await mailService.sendRegistrationOtpMail(
        otp,
        // userData.email
    );

    const otp_hash = await bcrypt.hash(
        otp,
        config.bcryptSaltRounds
    );

    const expires_at = new Date(
        Date.now() + 10 * 60 * 1000
    );


    await otpModel.deleteExistingOTP(
        userData.email,
        "registration"
    );


    await otpModel.createOTP({
        user_id: null,

        email: userData.email,

        user_name: userData.user_name,

        mobile_no: userData.mobile_no,

        password_hash,

        otp_hash,

        purpose: "registration",

        expires_at
    });


    console.log(
        `Registration OTP for ${userData.email}: ${otp}`
    );


    return {
        message:
            "OTP sent successfully. Please verify your email."
    };

};


const login = async (loginData) => {

    const user = await userModel.findByIdentifier(
        loginData.identifier
    );

    if (!user) {

        const error = new Error(
            "Invalid credentials"
        );

        error.statusCode = 401;

        throw error;
    };


    const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password_hash
    );


    if (!isPasswordValid) {

        const error = new Error(
            "Invalid credentials"
        );

        error.statusCode = 401;

        throw error;
    }


    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);


    const refreshTokenExpiresAt = new Date(
        Date.now() + config.jwt.refreshTokenExpiryMs
    );


    await refreshTokenModel.saveRefreshToken(
        user.id,
        refreshToken,
        refreshTokenExpiresAt
    );


    return {

        user: {
            id: user.id,
            user_name: user.user_name,
            email: user.email,
            mobile_no: user.mobile_no
        },

        accessToken,

        refreshToken
    };

};


const logout = async (refreshToken) => {

    if (!refreshToken) {
        return;
    }

    const storedToken =
        await refreshTokenModel.findRefreshToken(
            refreshToken
        );

    if (!storedToken) {
        return;
    }

    await refreshTokenModel.deleteRefreshToken(
        storedToken.id
    );

};


const verifyRegistrationOTP = async (
    verificationData
) => {

    const otpRecord = await otpModel.findValidOTP(
        verificationData.email,
        "registration"
    );


    if (!otpRecord) {

        const error = new Error(
            "OTP is invalid or expired"
        );

        error.statusCode = 400;

        throw error;
    }


    const isOTPValid = await bcrypt.compare(
        verificationData.otp,
        otpRecord.otp_hash
    );


    if (!isOTPValid) {

        const error = new Error(
            "Invalid OTP"
        );

        error.statusCode = 400;

        throw error;
    }


    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();


        const existingEmail = await userModel.findByEmail(
            otpRecord.email,
            connection
        );


        if (existingEmail) {

            const error = new Error(
                "Email already registered"
            );

            error.statusCode = 409;

            throw error;
        }


        const existingMobile = await userModel.findByMobile(
            otpRecord.mobile_no,
            connection
        );


        if (existingMobile) {

            const error = new Error(
                "Mobile number already registered"
            );

            error.statusCode = 409;

            throw error;
        }


        await userModel.createUser(
            {
                user_name: otpRecord.user_name,
                email: otpRecord.email,
                mobile_no: otpRecord.mobile_no,
                password_hash: otpRecord.password_hash
            },
            connection
        );


        // Delete OTP
        await otpModel.deleteOTP(
            otpRecord.id,
            connection
        );


        await connection.commit();


        return {
            message: "Registration completed successfully"
        };

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};

const refreshAccessToken = async (
    token
) => {

    if (!token) {

        const error = new Error(
            "Refresh token is required"
        );

        error.statusCode = 401;

        throw error;
    }


 
    let decoded;

    try {

        decoded = verifyRefreshToken(token);

    } catch (error) {

        error.statusCode = 401;

        throw error;
    }


    
    const storedToken = await refreshTokenModel.findRefreshToken(
        token
    );


    if (!storedToken) {

        const error = new Error(
            "Invalid refresh token"
        );

        error.statusCode = 401;

        throw error;
    }


    if (
        new Date(storedToken.expires_at) < new Date()
    ) {

        await refreshTokenModel.deleteRefreshToken(
            storedToken.id
        );

        const error = new Error(
            "Refresh token expired"
        );

        error.statusCode = 401;

        throw error;
    }


    
    const user = await userModel.findById(
        decoded.id
    );


    if (!user) {

        await refreshTokenModel.deleteRefreshToken(
            storedToken.id
        );

        const error = new Error(
            "User not found"
        );

        error.statusCode = 401;

        throw error;
    }



    if (storedToken.user_id !== user.id) {

        const error = new Error(
            "Invalid refresh token"
        );

        error.statusCode = 401;

        throw error;
    }


   
    const accessToken = generateAccessToken(user);

    const newRefreshToken = generateRefreshToken(user);


    const newExpiresAt = new Date(
        Date.now() + config.jwt.refreshTokenExpiryMs
    );


   
    await refreshTokenModel.updateRefreshToken(
        storedToken.id,
        newRefreshToken,
        newExpiresAt
    );


    return {
        accessToken,
        refreshToken: newRefreshToken
    };

};


const forgotPassword = async (email) => {
    

    const user = await userModel.findByEmail(
        email
    );

    if (!user) {
        return {
            message:
                "If an account exists with this email, an OTP has been sent"
        };
    }

    const otp = generateOTP();
    
    await mailService.sendForgotPasswordMail(otp);

    const otp_hash = await bcrypt.hash(
        otp,
        config.bcryptSaltRounds
    );

    const expires_at = new Date(
        Date.now() + 10 * 60 * 1000
    );

    await otpModel.deleteExistingOTP(
        email,
        "password_reset"
    );

    await otpModel.createOTP({
        user_id: user.id,
        email: user.email,
        user_name: user.user_name,
        mobile_no: user.mobile_no,
        password_hash: user.password_hash,
        otp_hash,
        purpose: "password_reset",
        expires_at
    });

     return {
        message:
            "If an account exists with this email, an OTP has been sent"
    };

};


const resetPassword = async (
    resetData
) => {

    const {
        email,
        otp,
        password
    } = resetData;


    const otpRecord = await otpModel.findValidOTP(
        email,
        "password_reset"
    );


    if (!otpRecord) {

        const error = new Error(
            "OTP is invalid or expired"
        );

        error.statusCode = 400;

        throw error;

    }


    const isOTPValid = await bcrypt.compare(
        otp,
        otpRecord.otp_hash
    );


    if (!isOTPValid) {

        const error = new Error(
            "Invalid OTP"
        );

        error.statusCode = 400;

        throw error;

    }


    const user = await userModel.findByEmail(
        email
    );


    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;

    }


    const password_hash = await bcrypt.hash(
        password,
        config.bcryptSaltRounds
    );


    const connection = await db.getConnection();


    try {

        await connection.beginTransaction();


        await userModel.updatePassword(
            user.id,
            password_hash,
            connection
        );


        await otpModel.deleteOTP(
            otpRecord.id,
            connection
        );


        await connection.commit();


        return {
            message:
                "Password reset successfully"
        };

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};

module.exports = {
    register,
    verifyRegistrationOTP,
    login,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword
};

