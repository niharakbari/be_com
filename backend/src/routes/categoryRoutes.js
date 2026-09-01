const express = require("express");

const categoryController = require("../controllers/categoryController");

const { protect } = require(
    "../middlewares/authMiddleware"
);

const {
    createCategoryValidation,
    updateCategoryValidation
} = require(
    "../validations/categoryValidation"
);

const { validate } = require(
    "../middlewares/validationMiddleware"
);

const router = express.Router();


router.post(
    "/",
    protect,
    validate(createCategoryValidation),
    categoryController.createCategory
);


router.get(
    "/",
    protect,
    categoryController.getCategories
);


router.patch(
    "/:id",
    protect,
    validate(updateCategoryValidation),
    categoryController.updateCategory
);


router.delete(
    "/:id",
    protect,
    categoryController.deleteCategory
);


module.exports = router;