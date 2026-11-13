const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { optionalProtect } = require("../middleware/authMiddleware");

router.post("/:reviewId/helpful", optionalProtect, reviewController.toggleHelpful);

module.exports = router;

