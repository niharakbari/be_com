const express = require('express');
const router = express.Router();

const { protect } = require ("../middlewares/authMiddleware")

const { validate } = require(`../middlewares/validationMiddleware`)
const { updateProfileValidation } = require("../validations/userValidation")

const userController = require('../controllers/userController');

3
router.get("/me", protect, userController.getMe);

router.patch("/me", protect, validate(updateProfileValidation), userController.updateMe);

module.exports = router;