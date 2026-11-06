 const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const validate = require("../middleware/validateMiddleware");
const {
  registerValidation,
  checkEmailValidation,
} = require("../validators/authValidator");

// Check user email availability (matches RTK Query /users/is-available)
router.post("/is-available", checkEmailValidation, validate, authController.checkAvailability);

// User routes
router.get("/", userController.getUsers);
router.post("/", registerValidation, validate, authController.register);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
