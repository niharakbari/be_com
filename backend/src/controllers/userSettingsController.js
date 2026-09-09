const userSettingsService = require("../services/userSettingsService");


const getSettings = async (
    req,
    res,
    next
) => {

    try {

        const settings =
            await userSettingsService.getSettings(
                req.user.id
            );


        return res.status(200).json({
            success: true,
            data: settings
        });

    } catch (error) {

        next(error);

    }

};


const updateSettings = async (
    req,
    res,
    next
) => {

    try {

        const settings =
            await userSettingsService.updateSettings(
                req.user.id,
                req.body
            );


        return res.status(200).json({
            success: true,
            data: settings
        });

    } catch (error) {

        next(error);

    }

};


module.exports = {
    getSettings,
    updateSettings
};