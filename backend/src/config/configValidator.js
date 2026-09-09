const validateConfig = (config) => {

    const errors = [];


    /* PORT */

    const port = Number(config.port);

    if (
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535
    ) {
        errors.push(
            "PORT must be an integer between 1 and 65535"
        );
    }


    /* Database Connection Limit */

    const connectionLimit =
        Number(config.database.limit);

    if (
        !Number.isInteger(connectionLimit) ||
        connectionLimit < 1
    ) {
        errors.push(
            "DB_CONNECTION_LIMIT must be a positive integer"
        );
    }


    /* bcrypt */

    const saltRounds =
        Number(config.bcryptSaltRounds);

    if (
        !Number.isInteger(saltRounds) ||
        saltRounds < 10 ||
        saltRounds > 20
    ) {
        errors.push(
            "bcryptSaltRounds must be an integer between 10 and 20"
        );
    }


    /* JWT Algorithm */

    const allowedAlgorithms = ["HS256"];

    if (!allowedAlgorithms.includes(config.jwt.algorithm)) {

        errors.push(
            `JWT_ALGORITHM must be one of: ${allowedAlgorithms.join(", ")}`
        );

    }


    /* JWT Secrets */

    if (config.jwt.accessTokenSecret.length < 32) {

        errors.push(
            "JWT_ACCESS_SECRET must be at least 32 characters long"
        );

    }

    if (config.jwt.refreshTokenSecret.length < 32) {

        errors.push(
            "JWT_REFRESH_SECRET must be at least 32 characters long"
        );

    }

    if (
        config.jwt.accessTokenSecret ===
        config.jwt.refreshTokenSecret
    ) {

        errors.push(
            "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different"
        );

    }


    /* JWT Expiry */

    const validJwtExpiry =
        /^\d+(s|m|h|d|w|y)$/;

    if (
        !validJwtExpiry.test(
            config.jwt.accessTokenExpiry
        )
    ) {

        errors.push(
            "JWT_ACCESS_EXPIRY must use a valid format such as 15m, 1h, or 1d"
        );

    }

    if (
        !validJwtExpiry.test(
            config.jwt.refreshTokenExpiry
        )
    ) {

        errors.push(
            "JWT_REFRESH_EXPIRY must use a valid format such as 7d or 30d"
        );

    }


    return errors;

};


module.exports = validateConfig;