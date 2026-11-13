const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Customer & Public tracking routes
router.get("/track/:code", orderController.trackOrder);
router.get("/my", protect, orderController.getMyOrders);
router.post("/", protect, orderController.createOrder);
router.patch("/:id/cancel", protect, orderController.cancelOrder);
router.patch("/:id/return", protect, orderController.requestReturn);

// Admin / Manager order fulfillment routes
router.get("/", protect, authorize("admin", "manager"), orderController.getAllOrders);
router.patch("/:id/status", protect, authorize("admin", "manager"), orderController.updateOrderStatus);

module.exports = router;

