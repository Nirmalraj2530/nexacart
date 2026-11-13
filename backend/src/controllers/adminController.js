const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");

/**
 * @desc    Get real-time MongoDB analytics for Admin & Manager dashboard
 * @route   GET /api/admin/analytics
 * @access  Private (Admin / Manager)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [totalProducts, totalCategories, totalUsers, totalReviews, allOrders, lowStockRaw] =
      await Promise.all([
        Product.countDocuments(),
        Category.countDocuments(),
        User.countDocuments(),
        Review.countDocuments(),
        Order.find().sort({ createdAt: -1 }),
        Product.find({ stock: { $lte: 20 } })
          .populate("category", "name")
          .sort({ stock: 1 })
          .limit(8),
      ]);

    let totalRevenue = 0;
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
      "Return Requested": 0,
      Returned: 0,
    };

    for (const o of allOrders) {
      if (o.status !== "Cancelled" && o.status !== "Refunded") {
        totalRevenue += Number(o.total) || 0;
      }
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    const totalOrders = allOrders.length;
    const activeOrders =
      (statusCounts.Pending || 0) +
      (statusCounts.Confirmed || 0) +
      (statusCounts.Processing || 0) +
      (statusCounts.Shipped || 0) +
      (statusCounts["Out for Delivery"] || 0);
    const deliveredOrders = statusCounts.Delivered || 0;
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      kpis: {
        totalProducts,
        totalCategories,
        totalUsers,
        totalOrders,
        activeOrders,
        deliveredOrders,
        totalReviews,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        avgOrderValue,
      },
      ordersByStatus: statusCounts,
      lowStockProducts: lowStockRaw.map((p) => p.toJSON()),
      recentOrders: allOrders.slice(0, 5).map((o) => o.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};

