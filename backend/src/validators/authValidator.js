const { body } = require("express-validator");

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters long"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("confirmPassword")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("role")
    .optional()
    .isIn(["customer", "manager", "admin"])
    .withMessage("Role must be either customer, manager, or admin"),

  body("avatar")
    .optional()
    .trim(),
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * Validation rules for checking email availability
 */
const checkEmailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
];

module.exports = {
  registerValidation,
  loginValidation,
  checkEmailValidation,
};

