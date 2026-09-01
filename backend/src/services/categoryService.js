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


module.exports = {
    createCategory
};