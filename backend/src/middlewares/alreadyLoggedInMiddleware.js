const refreshTokenModel =
    require("../models/refreshTokenModel");

const { verifyRefreshToken } =
    require("../utils/jwt");


const alreadyLoggedIn = async (
    req,
    res,
    next
) => {

    try {

        const token = req.cookies.refreshToken;
        console.log("[alreadyLoggedIn] token:", token);

        // No refresh token → definitely not logged in
        if (!token) {
            console.log("[alreadyLoggedIn] No token found in cookies.");
            return next();
        }

        // Verify JWT
        const decoded = verifyRefreshToken(token);
        console.log("[alreadyLoggedIn] decoded:", decoded);

        // Check whether token exists in database
        const storedToken = await refreshTokenModel.findRefreshToken(token);
        console.log("[alreadyLoggedIn] storedToken:", storedToken);

        // Valid session exists
        if (storedToken && String(storedToken.user_id) === String(decoded.id)) {
            console.log("[alreadyLoggedIn] Active session found, throwing error.");
            const error = new Error("You are already logged in");
            error.statusCode = 400;
            return next(error);
        }

        console.log("[alreadyLoggedIn] Invalid or mismatched token, allowing login.");
        // Invalid/old token → allow login
        return next();

    } catch (error) {
        console.log("[alreadyLoggedIn] Error caught:", error.message);
        /*
            Invalid or expired refresh token.

            User should still be allowed to login.
        */

        return next();
    }

};


module.exports = {
    alreadyLoggedIn
};