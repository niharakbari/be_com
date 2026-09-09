const logger = require("./logger");

require("dotenv").config();


const missingVariables = [];


const getRequiredEnv = (name) => {

    const value = process.env[name];

    if (!value) {
        missingVariables.push(name);
        return undefined;
    }

    return value;
};


const accessTokenSecret = getRequiredEnv("JWT_ACCESS_SECRET");
const refreshTokenSecret = getRequiredEnv("JWT_REFRESH_SECRET");
const accessTokenExpiry = getRequiredEnv("JWT_ACCESS_EXPIRY");
const refreshTokenExpiry = getRequiredEnv("JWT_REFRESH_EXPIRY");
const algorithm = getRequiredEnv("JWT_ALGORITHM");
const bcryptSaltRounds = getRequiredEnv("bcryptSaltRounds");

const port = getRequiredEnv("PORT");

const databaseName = getRequiredEnv("DB_NAME");
const databaseHost = getRequiredEnv("DB_HOST");
const databaseUser = getRequiredEnv("DB_USER");
const databasePassword = getRequiredEnv("DB_PASSWORD");
const databaseConnectionLimit = getRequiredEnv("DB_CONNECTION_LIMIT");

const resendApiKey = getRequiredEnv("RESEND_API_KEY");


if (missingVariables.length > 0) {

    logger.warn(
        `Startup aborted: missing required environment variables: ${missingVariables.join(", ")}`
    );

    process.exit(1);

}


logger.info(
    "Environment configuration loaded successfully"
);


module.exports = {

    port : port,

    database : {
        name : databaseName,
        host : databaseHost,
        user : databaseUser,
        password : databasePassword,
        limit : databaseConnectionLimit
    },

    jwt: {
        accessTokenSecret,
        refreshTokenSecret,
        accessTokenExpiry,
        refreshTokenExpiry,
        refreshTokenExpiryMs: 30 * 24 * 60 * 60 * 1000,
        algorithm
    },

    bcryptSaltRounds : Number(bcryptSaltRounds),

    resend : {
        api : resendApiKey
    }

};