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


const getCategories = async (req, res, next) => {

    try {
        const userId = req.user.id;

        const categories = await categoryService.getCategories(
            userId
        );

        return res.status(200).json({
            success: true,
            data: categories
        });

    } catch (err) {
        logger.error(err.message);
        next(err);
    }
};


const updateCategory = async (req, res, next) => {

    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, type } = req.body;

        const category = await categoryService.updateCategory(
            id,
            userId,
            name,
            type
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (err) {
        logger.error(err.message);
        next(err);
    }
};


const deleteCategory = async (req, res, next) => {

    try {
        const userId = req.user.id;
        const { id } = req.params;

        await categoryService.deleteCategory(
            id,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (err) {
        logger.error(err.message);
        next(err);
    }
};


module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};