const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, cartController.getWishlist);
router.post("/", protect, cartController.addWishlistItem);
router.delete("/:productId", protect, cartController.removeWishlistItem);
router.delete("/", protect, cartController.clearWishlist);

module.exports = router;

