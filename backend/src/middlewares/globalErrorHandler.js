const logger = require("../config/logger");

const AppError = require("../utils/AppError");

const cookieOptions = require("../utils/cookieOptions");

const globalErrorHandler = (err, req, res, next) => {

    logger.error(err.stack || err.message);

    if (err.message === "Refresh token expired") {
        res.clearCookie("refreshToken", cookieOptions);
        res.clearCookie("accessToken", cookieOptions);
    }

    const statusCode = err.statusCode || 500;

    const message =
        err instanceof AppError
            ? err.message
            : "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = globalErrorHandler;