const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/validate", couponController.validateCoupon);
router.get("/", protect, authorize("admin", "manager"), couponController.getCoupons);
router.post("/", protect, authorize("admin", "manager"), couponController.createCoupon);
router.delete("/:id", protect, authorize("admin", "manager"), couponController.deleteCoupon);

module.exports = router;

