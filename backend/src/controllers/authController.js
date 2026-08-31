const authService = require("../services/authService");


const config = require("../config/config");

const register = async (req, res, next) => {

    try {

        const result = await authService.register(
            req.body
        );

        return res.status(201).json({
            success: true,
            message: result.message
        });

    } catch (error) {

        next(error);

    }

};


const login = async (req, res, next) => {

    try {

        const result = await authService.login(
            req.body
        );


        res.cookie(
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: config.jwt.refreshTokenExpiryMs
            }
        );


        return res.status(200).json({
            success: true,

            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        });

    } catch (error) {

        next(error);

    }

};


const logout = async (req, res, next) => {

    try {


        const refreshToken = req.cookies.refreshToken;

                if (!refreshToken) {

            const error = new Error(
                "Please login first"
            );

            error.statusCode = 401;

            throw error;
        };

        await authService.logout(
            refreshToken
        );

        res.clearCookie(
            "refreshToken",
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        }); 

    } catch (error) {

        next(error);

    }

};


const refreshToken = async (req, res, next) => {

    try {

        const token = req.cookies.refreshToken;

        const result = await authService.refreshAccessToken(
            token
        );


        res.cookie(
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: config.jwt.refreshTokenExpiryMs
            }
        );


        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",

            data: {
                accessToken: result.accessToken
            }
        });

    } catch (error) {

        next(error);

    }

};

const verifyRegistrationOTP = async (
    req,
    res,
    next
) => {

    try {

        const result = await authService.verifyRegistrationOTP(
            req.body
        );

        return res.status(201).json({
            success: true,
            message: result.message
        });

    } catch (error) {

        next(error);

    }

};


const forgotPassword = async (
    req,
    res,
    next
) => {

    console.log("controller reached");
    try {

        const result = await authService.forgotPassword(
            req.body.email
        );


        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {

        console.log("controller error:", error);
        next(error);

    }

};


const resetPassword = async (
    req,
    res,
    next
) => {

    try {

        const result = await authService.resetPassword(
            req.body
        );


        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {

        next(error);

    }

};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    verifyRegistrationOTP,
    forgotPassword,
    resetPassword
};