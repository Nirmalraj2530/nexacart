const User = require("../models/User");

const formatCart = (items = []) =>
  items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    title: item.title,
    price: item.price,
    image: item.image,
    categoryName: item.categoryName || "General",
    quantity: item.quantity,
  }));

const formatWishlist = (items = []) =>
  items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    title: item.title,
    price: item.price,
    image: item.image,
    categoryName: item.categoryName || "General",
    addedAt: item.addedAt,
  }));

/**
 * @desc    Get authenticated user's synced cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, items: formatCart(user.cart) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Replace / sync user's cart
 * @route   PUT /api/cart
 * @access  Private
 */
const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.cart = Array.isArray(items)
      ? items
          .filter((i) => i && (i.id || i.productId))
          .map((i) => ({
            productId: String(i.productId || i.id),
            title: String(i.title || "Product"),
            price: Math.max(0, Number(i.price) || 0),
            image: i.image || "",
            categoryName: i.categoryName || "General",
            quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
          }))
      : [];

    await user.save();
    return res.status(200).json({ success: true, items: formatCart(user.cart) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear authenticated user's cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
    return res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, items: formatWishlist(user.wishlist) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or toggle item in wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addWishlistItem = async (req, res, next) => {
  try {
    const item = req.body;
    const productId = String(item?.productId || item?.id || "");
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const exists = user.wishlist.some((w) => w.productId === productId);
    if (!exists) {
      user.wishlist.push({
        productId,
        title: String(item.title || "Product"),
        price: Math.max(0, Number(item.price) || 0),
        image: item.image || item.images?.[0] || "",
        categoryName: item.categoryName || item.category?.name || "General",
        addedAt: new Date(),
      });
      await user.save();
    }

    return res.status(200).json({ success: true, items: formatWishlist(user.wishlist) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeWishlistItem = async (req, res, next) => {
  try {
    const productId = String(req.params.productId || "");
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.wishlist = user.wishlist.filter((w) => w.productId !== productId);
    await user.save();
    return res.status(200).json({ success: true, items: formatWishlist(user.wishlist) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
const clearWishlist = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { wishlist: [] } });
    return res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  syncCart,
  clearCart,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
};

