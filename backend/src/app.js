const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const fileRoutes = require("./routes/fileRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// 1. CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigin === "*" || origin === allowedOrigin || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Request Parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 2.1 Live Console Logger for Request/Response Tracking
app.use((req, res, next) => {
  const start = Date.now();
  const safeBody = req.body ? { ...req.body } : {};
  if (safeBody.password) safeBody.password = "******";
  if (safeBody.confirmPassword) safeBody.confirmPassword = "******";
  if (safeBody.currentPassword) safeBody.currentPassword = "******";
  if (safeBody.newPassword) safeBody.newPassword = "******";

  console.log(`\n📥 [BACKEND REQUEST] ${req.method} ${req.originalUrl} - ${new Date().toLocaleTimeString()}`);
  if (Object.keys(safeBody).length > 0) {
    console.log(`📦 [BACKEND BODY]:`, JSON.stringify(safeBody, null, 2));
  }

  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "❌" : "✅";
    console.log(`📤 [BACKEND RESPONSE] ${statusColor} ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
    if (data?.message) {
      console.log(`💬 [BACKEND MSG]: ${data.message}`);
    }
    if (data?.user) {
      console.log(`👤 [BACKEND USER]: ${data.user.name} (${data.user.email}) [Role: ${data.user.role}]`);
    }
    return originalJson.call(this, data);
  };

  next();
});

// 3. API Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexaCart API is active and healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// 4. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

// Root route aliases for flexible client base URLs
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/files", fileRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/coupons", couponRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/admin", adminRoutes);

// Store Locations endpoint
const STORE_LOCATIONS = [
  {
    id: 1,
    name: "NexaCart Flagship Store - Downtown",
    city: "New York",
    address: "450 Fifth Avenue, Suite 100, New York, NY 10018",
    latitude: 40.7517,
    longitude: -73.9822,
  },
  {
    id: 2,
    name: "NexaCart Tech Hub & Pickup Center",
    city: "San Francisco",
    address: "725 Market Street, San Francisco, CA 94103",
    latitude: 37.7869,
    longitude: -122.4041,
  },
  {
    id: 3,
    name: "NexaCart Express Distribution Hub",
    city: "Chicago",
    address: "210 N Michigan Ave, Chicago, IL 60601",
    latitude: 41.8861,
    longitude: -87.6245,
  },
  {
    id: 4,
    name: "NexaCart South Fulfillment Station",
    city: "Austin",
    address: "500 Congress Ave, Austin, TX 78701",
    latitude: 30.2672,
    longitude: -97.7431,
  },
];

app.get("/api/locations", (req, res) => res.status(200).json(STORE_LOCATIONS));
app.get("/locations", (req, res) => res.status(200).json(STORE_LOCATIONS));

// Root Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    name: "NexaCart E-Commerce REST API",
    version: "2.1.0",
    docs: "/api/health",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      categories: "/api/categories",
      products: "/api/products",
      orders: "/api/orders",
      reviews: "/api/reviews",
      coupons: "/api/coupons",
      cart: "/api/cart",
      wishlist: "/api/wishlist",
      files: "/api/files",
      locations: "/api/locations",
      admin: "/api/admin/analytics",
    },
  });
});

// 5. 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
