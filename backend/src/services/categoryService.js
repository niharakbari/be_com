const AppError = require("../utils/AppError");
const categoryModel = require("../models/categoryModel");


const createCategory = async (userId, name, type) => {

    const existingCategory = await categoryModel.findCategory(
        userId,
        name,
        type
    );

    if (existingCategory.length > 0) {
        throw new AppError("Category already exists", 409);
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
        throw new AppError("Category not found", 404);
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
        throw new AppError("Category already exists", 409);
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


const deleteCategory = async (categoryId, userId) => {
    try {
        const affectedRows = await categoryModel.deleteCategory(categoryId, userId);
        if (affectedRows === 0) {
            throw new AppError("Category not found", 404);
        }
        return true;
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new AppError("Cannot delete category because it is in use. Please reassign its items first.", 409);
        }
        throw err;
    }
};


const reassignAndDeleteCategory = async (userId, oldCategoryId, newCategoryId) => {
    if (Number(oldCategoryId) === Number(newCategoryId)) {
        throw new AppError("New category cannot be the same as the old category", 400);
    }

    const oldCategory = await categoryModel.findCategoryById(oldCategoryId, userId);
    if (!oldCategory) {
        throw new AppError("Old category not found", 404);
    }

    const newCategory = await categoryModel.findCategoryById(newCategoryId, userId);
    if (!newCategory) {
        throw new AppError("Replacement category not found", 404);
    }

    if (oldCategory.type !== newCategory.type) {
        throw new AppError("Categories must be of the same type (income/expense)", 400);
    }

    const affectedRows = await categoryModel.reassignAndDeleteCategory(userId, oldCategoryId, newCategoryId);
    
    if (affectedRows === 0) {
        throw new AppError("Failed to delete category", 500);
    }

    return true;
};


const getCategoryUsage = async (categoryId, userId) => {
    const category = await categoryModel.findCategoryById(categoryId, userId);
    if (!category) throw new AppError("Category not found", 404);
    return await categoryModel.getCategoryUsage(categoryId, userId);
};

module.exports = {
    getCategoryUsage,
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    reassignAndDeleteCategory
    
};