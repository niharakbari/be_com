const userService = require("../services/userService");


const getMe = async (req, res, next) => {

    try {

        const result = await userService.getMe(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);

    }

};


const updateMe = async (req, res, next) => {

    try {

        const updatedUser = await userService.updateMe(
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            data: updatedUser
        });

    } catch (error) {

        next(error);

    }

};


module.exports = {
    getMe,
    updateMe
};