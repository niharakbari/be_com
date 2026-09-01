const categoryService = require("../services/categoryService");
const logger = require("../config/logger");

const createCategory = async (req, res, next) => {


    try {
        const userId = req.user.id;

        const { name, type } = req.body;

        const category = await categoryService.createCategory(
            userId,
            name,
            type
        );

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (err) {
        logger.error(err.message);
        next(err);
    }
};


module.exports = {
    createCategory
};