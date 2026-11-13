const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Category routes
router.get("/", categoryController.getCategories);
router.post("/", protect, authorize("admin", "manager"), categoryController.createCategory);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id/products", categoryController.getCategoryProducts);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", protect, authorize("admin", "manager"), categoryController.updateCategory);
router.delete("/:id", protect, authorize("admin", "manager"), categoryController.deleteCategory);

module.exports = router;
