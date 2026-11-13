const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Product routes (specific routes like /slug/... must precede /:id)
router.get("/", productController.getProducts);
router.post("/", protect, authorize("admin", "manager"), productController.createProduct);
router.get("/slug/:slug/related", productController.getRelatedProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id/reviews", reviewController.getProductReviews);
router.post("/:id/reviews", protect, reviewController.createProductReview);
router.get("/:id/related", productController.getRelatedProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", protect, authorize("admin", "manager"), productController.updateProduct);
router.delete("/:id", protect, authorize("admin", "manager"), productController.deleteProduct);

module.exports = router;
