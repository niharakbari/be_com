const categoryModel = require("../models/categoryModel");


const createCategory = async (userId, name, type) => {

    const existingCategory = await categoryModel.findCategory(
        userId,
        name,
        type
    );

    if (existingCategory.length > 0) {
        const error = new Error("Category already exists");
        error.statusCode = 409;
        throw error;
    }

    const categoryId = await categoryModel.createCategory(
        userId,
        name,
        type
    );

    return {
        id: categoryId,
        name,
        type
    };
};


const getCategories = async (userId) => {

    return await categoryModel.getCategories(userId);
};


const updateCategory = async (
    categoryId,
    userId,
    name,
    type
) => {

    const category = await categoryModel.findCategoryById(
        categoryId,
        userId
    );

    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    const existingCategory = await categoryModel.findCategory(
        userId,
        name,
        type
    );

    if (
        existingCategory.length > 0 &&
        existingCategory[0].id !== Number(categoryId)
    ) {
        const error = new Error("Category already exists");
        error.statusCode = 409;
        throw error;
    }

    await categoryModel.updateCategory(
        categoryId,
        userId,
        name,
        type
    );

    return {
        id: Number(categoryId),
        name,
        type
    };
};


const deleteCategory = async (
    categoryId,
    userId
) => {

    const affectedRows = await categoryModel.deleteCategory(
        categoryId,
        userId
    );

    if (affectedRows === 0) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    return true;
};


module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};