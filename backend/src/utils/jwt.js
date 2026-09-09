const jwt = require("jsonwebtoken");

const config = require("../config/config");


const generateAccessToken = (user) => {

    return jwt.sign(

        {
            id: user.id,
            email: user.email
        },

        config.jwt.accessTokenSecret,

        {
            expiresIn: config.jwt.accessTokenExpiry,
            algorithm: config.jwt.algorithm
        }

    );

};




const generateRefreshToken = (user) => {

    return jwt.sign(
        {
            id: user.id
        },

        config.jwt.refreshTokenSecret,
        {
            expiresIn: config.jwt.refreshTokenExpiry,
            algorithm: config.jwt.algorithm
        }

    );

};



const verifyAccessToken = (token) => {

    return jwt.verify(
        token,
        config.jwt.accessTokenSecret,
        {
            algorithms: [config.jwt.algorithm]
        }
    );

};



const verifyRefreshToken = (token) => {

    return jwt.verify(
        token,
        config.jwt.refreshTokenSecret,
        {
            algorithms: [config.jwt.algorithm]
        }
    );

};


module.exports = {

    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken

};