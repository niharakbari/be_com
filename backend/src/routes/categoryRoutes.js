const { idParamValidation } = require("../validations/commonValidation");
const express = require("express");

const categoryController = require("../controllers/categoryController");

const { protect } = require(
    "../middlewares/authMiddleware"
);

const {
    createCategoryValidation,
    updateCategoryValidation,
    reassignCategoryValidation
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


router.post(
    "/:id/reassign",
    protect,
    validate(idParamValidation, "params"),
    validate(reassignCategoryValidation, "body"),
    categoryController.reassignAndDeleteCategory
);


router.patch(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    validate(updateCategoryValidation, "body"),
    categoryController.updateCategory
);


router.delete(
    "/:id",
    protect,
    validate(idParamValidation, "params"),
    categoryController.deleteCategory
);


router.get(
    "/:id/usage",
    protect,
    validate(idParamValidation, "params"),
    categoryController.getCategoryUsage
);

module.exports = router;
