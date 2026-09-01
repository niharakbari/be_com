const express = require("express");

const categoryController = require("../controllers/categoryController");
const { protect } = require("../middlewares/authMiddleware");

const { createCategoryValidation } = require("../validations/categoryValidation");

const { validate } = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post("/", protect, validate(createCategoryValidation), categoryController.createCategory);

module.exports = router;