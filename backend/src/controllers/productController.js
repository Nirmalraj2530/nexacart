const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * Helper to resolve a category reference from categoryId / category input
 */
const resolveCategory = async (categoryInput) => {
  if (categoryInput) {
    if (mongoose.Types.ObjectId.isValid(categoryInput)) {
      const cat = await Category.findById(categoryInput);
      if (cat) return cat;
    }
    const catBySlugOrName = await Category.findOne({
      $or: [
        { slug: String(categoryInput).toLowerCase() },
        { name: { $regex: new RegExp(`^${String(categoryInput).trim()}$`, "i") } },
      ],
    });
    if (catBySlugOrName) return catBySlugOrName;
  }

  // Fallback: return first available category
  let fallback = await Category.findOne();
  if (!fallback) {
    fallback = await Category.create({
      name: "General",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    });
  }
  return fallback;
};

/**
 * @desc    Get all products with optional filters
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { title, categoryId, price_min, price_max, offset, limit } = req.query;
    const filter = {};

    if (title && title.trim()) {
      filter.title = { $regex: title.trim(), $options: "i" };
    }

    if (categoryId && categoryId.trim() !== "") {
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        filter.category = categoryId;
      } else {
        const cat = await Category.findOne({
          $or: [
            { slug: String(categoryId).toLowerCase() },
            { name: { $regex: new RegExp(`^${String(categoryId).trim()}$`, "i") } },
          ],
        });
        if (cat) {
          filter.category = cat._id;
        } else {
          return res.status(200).json([]);
        }
      }
    }

    if (price_min !== undefined || price_max !== undefined) {
      filter.price = {};
      if (price_min !== undefined && price_min !== "") {
        filter.price.$gte = Number(price_min);
      }
      if (price_max !== undefined && price_max !== "") {
        filter.price.$lte = Number(price_max);
      }
      if (Object.keys(filter.price).length === 0) {
        delete filter.price;
      }
    }

    let query = Product.find(filter).populate("category").sort({ createdAt: -1 });

    if (offset !== undefined && !isNaN(Number(offset))) {
      query = query.skip(Number(offset));
    }
    if (limit !== undefined && !isNaN(Number(limit)) && Number(limit) > 0) {
      query = query.limit(Number(limit));
    }

    const products = await query;
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate("category");
    }
    if (!product) {
      product = await Product.findOne({ slug: id.toLowerCase() }).populate("category");
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by slug
 * @route   GET /api/products/slug/:slug
 * @access  Public
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug.toLowerCase() }).populate("category");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id.toLowerCase() });
    }

    if (!product) {
      const fallback = await Product.find().populate("category").limit(4);
      return res.status(200).json(fallback);
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate("category")
      .limit(8);

    return res.status(200).json(related);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin / Manager
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, price, description, categoryId, category, images, stock } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Product title is required" });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Valid product price is required" });
    }

    const resolvedCategory = await resolveCategory(categoryId || category);

    let normalizedImages = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim() !== "")
      : typeof images === "string" && images.trim() !== ""
      ? [images.trim()]
      : [];

    if (normalizedImages.length === 0) {
      normalizedImages = [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      ];
    }

    const created = await Product.create({
      title: title.trim(),
      price: Number(price),
      description: description?.trim() || "Premium quality NexaCart product crafted with care.",
      category: resolvedCategory._id,
      images: normalizedImages,
      stock: stock !== undefined ? Number(stock) : 50,
    });

    const populated = await Product.findById(created._id).populate("category");
    return res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin / Manager
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, price, description, categoryId, category, images, stock } = req.body;

    const product = mongoose.Types.ObjectId.isValid(id)
      ? await Product.findById(id)
      : await Product.findOne({ slug: id.toLowerCase() });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (title !== undefined && title.trim()) {
      product.title = title.trim();
    }
    if (price !== undefined && !isNaN(Number(price))) {
      product.price = Number(price);
    }
    if (description !== undefined) {
      product.description = description.trim();
    }
    if (categoryId || category) {
      const resolvedCategory = await resolveCategory(categoryId || category);
      product.category = resolvedCategory._id;
    }
    if (images !== undefined) {
      const normalizedImages = Array.isArray(images)
        ? images.filter((img) => typeof img === "string" && img.trim() !== "")
        : typeof images === "string" && images.trim() !== ""
        ? [images.trim()]
        : [];
      if (normalizedImages.length > 0) {
        product.images = normalizedImages;
      }
    }
    if (stock !== undefined && !isNaN(Number(stock))) {
      product.stock = Number(stock);
    }

    await product.save();
    const populated = await Product.findById(product._id).populate("category");
    return res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = mongoose.Types.ObjectId.isValid(id)
      ? await Product.findById(id)
      : await Product.findOne({ slug: id.toLowerCase() });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(product._id);
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

