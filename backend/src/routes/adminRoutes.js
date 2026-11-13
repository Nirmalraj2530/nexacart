const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/analytics", protect, authorize("admin", "manager"), adminController.getAnalytics);

module.exports = router;

