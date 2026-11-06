const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 2.1 Live Console Logger for Request/Response Tracking
app.use((req, res, next) => {
  const start = Date.now();
  const safeBody = req.body ? { ...req.body } : {};
  if (safeBody.password) safeBody.password = "******";
  if (safeBody.confirmPassword) safeBody.confirmPassword = "******";

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

// Root route aliases for flexible client base URLs
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Root Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    name: "NexaCart E-Commerce REST API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// 5. 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;

