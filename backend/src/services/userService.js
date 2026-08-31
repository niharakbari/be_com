const userModel = require("../models/userModel");

const AppError = require("../utils/AppError");


const getMe = async (userId) => {

    const user = await userModel.findById(
        userId
    );


    if (!user) {

        throw new AppError(
            "User not found",
            404
        );

    }


    return user;

};


const updateMe = async (
    userId,
    updates
) => {


    if (updates.mobile_no !== undefined) {

        const existingUser = await userModel.findByMobile(
            updates.mobile_no
        );


        if (
            existingUser &&
            Number(existingUser.id) !== Number(userId)
        ) {

            throw new AppError(
                "Mobile number already registered",
                409
            );

        }

    }


    const result = await userModel.updateUser(
        userId,
        updates
    );


    if (!result) {

        throw new AppError(
            "No valid fields provided for update",
            400
        );

    }


    const updatedUser = await userModel.findById(
        userId
    );


    if (!updatedUser) {

        throw new AppError(
            "User not found",
            404
        );

    }


    return updatedUser;

};


module.exports = {
    getMe,
    updateMe
};