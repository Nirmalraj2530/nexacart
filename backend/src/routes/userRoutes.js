const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  registerValidation,
  checkEmailValidation,
} = require("../validators/authValidator");

// Check user email availability (matches RTK Query /users/is-available)
router.post("/is-available", checkEmailValidation, validate, authController.checkAvailability);

// Authenticated customer address book routes (must precede /:id)
router.get("/addresses", protect, userController.getAddresses);
router.post("/addresses", protect, userController.addAddress);
router.put("/addresses/:addressId", protect, userController.updateAddress);
router.patch("/addresses/:addressId/default", protect, userController.setDefaultAddress);
router.delete("/addresses/:addressId", protect, userController.deleteAddress);

// Protected User Management routes
router.get("/", protect, authorize("admin"), userController.getUsers);
router.post("/", protect, authorize("admin"), registerValidation, validate, userController.createUser);
router.get("/:id", protect, userController.getUserById);
router.put("/:id", protect, authorize("admin"), userController.updateUser);
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);

module.exports = router;
