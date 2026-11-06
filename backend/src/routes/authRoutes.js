const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  registerValidation,
  loginValidation,
  checkEmailValidation,
} = require("../validators/authValidator");

// Public Authentication Routes
router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/check-email", checkEmailValidation, validate, authController.checkAvailability);
router.post("/logout", authController.logout);

// Protected Routes (Bearer Token Required)
router.get("/profile", protect, authController.getProfile);
router.post("/refresh-token", protect, authController.refreshToken);

module.exports = router;

