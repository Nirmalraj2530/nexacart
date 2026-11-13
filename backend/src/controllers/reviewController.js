const Review = require("../models/Review");
const Order = require("../models/Order");

/**
 * Compute rating summary from review list.
 */
const buildSummary = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    const rating = Math.min(5, Math.max(1, Number(r.rating) || 5));
    sum += rating;
    breakdown[rating] = (breakdown[rating] || 0) + 1;
  }

  return {
    average: Number((sum / reviews.length).toFixed(1)),
    total: reviews.length,
    breakdown,
  };
};

/**
 * @desc    Get reviews & rating summary for a product
 * @route   GET /api/products/:id/reviews
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const productId = String(req.params.id);
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      reviews: reviews.map((r) => r.toJSON()),
      summary: buildSummary(reviews),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a review for a product (marks verified if user ordered the item)
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const createProductReview = async (req, res, next) => {
  try {
    const productId = String(req.params.id);
    const { rating, title, body } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }
    if (!title || !String(title).trim() || !body || !String(body).trim()) {
      return res.status(400).json({ success: false, message: "Review title and comment are required." });
    }

    const existing = await Review.findOne({ productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this product.",
      });
    }

    const purchased = await Order.exists({
      user: req.user._id,
      "items.productId": productId,
      status: { $nin: ["Cancelled"] },
    });

    const review = await Review.create({
      productId,
      user: req.user._id,
      reviewer: req.user.name,
      avatar: req.user.avatar,
      rating: numRating,
      title: String(title).trim(),
      body: String(body).trim(),
      verified: Boolean(purchased),
    });

    return res.status(201).json({
      success: true,
      message: "Review published successfully!",
      review: review.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle helpful vote on a review
 * @route   POST /api/reviews/:reviewId/helpful
 * @access  Public (tracks user ID when signed in)
 */
const toggleHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const voterKey = req.user ? req.user._id.toString() : req.ip || "guest";
    const alreadyVoted = review.helpfulBy.includes(voterKey);

    if (req.user && alreadyVoted) {
      review.helpfulBy = review.helpfulBy.filter((id) => id !== voterKey);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      if (!review.helpfulBy.includes(voterKey)) {
        review.helpfulBy.push(voterKey);
      }
      review.helpful += 1;
    }

    await review.save();
    return res.status(200).json({
      success: true,
      helpful: review.helpful,
      review: review.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createProductReview,
  toggleHelpful,
};

