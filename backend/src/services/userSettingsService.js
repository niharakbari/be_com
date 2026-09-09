const userSettingsModel = require("../models/userSettingsModel");

const AppError = require("../utils/AppError");


const getSettings = async (userId) => {

    let settings = await userSettingsModel.findByUserId(
        userId
    );


    // Safety for existing users who don't have
    // a settings row yet.
    if (!settings) {

        await userSettingsModel.create(
            userId
        );

        settings = await userSettingsModel.findByUserId(
            userId
        );

    }


    if (!settings) {

        throw new AppError(
            "User settings not found",
            404
        );

    }


    return settings;
};


const updateSettings = async (
    userId,
    updates
) => {

    if (
        updates.budget_mode !== undefined &&
        !["monthly", "yearly"].includes(
            updates.budget_mode
        )
    ) {

        throw new AppError(
            "Invalid budget mode",
            400
        );

    }


    if (
        updates.onboarding_completed !== undefined &&
        typeof updates.onboarding_completed !== "boolean"
    ) {

        throw new AppError(
            "onboarding_completed must be a boolean",
            400
        );

    }


    // Make sure settings row exists.
    await getSettings(userId);


    const result = await userSettingsModel.update(
        userId,
        updates
    );


    if (!result) {

        throw new AppError(
            "No valid settings fields provided",
            400
        );

    }


    return await getSettings(userId);
};


module.exports = {
    getSettings,
    updateSettings
};