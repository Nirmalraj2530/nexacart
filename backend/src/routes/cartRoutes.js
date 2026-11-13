const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, cartController.getCart);
router.put("/", protect, cartController.syncCart);
router.delete("/", protect, cartController.clearCart);

module.exports = router;

