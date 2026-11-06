const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`[NexaCart Backend] Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  console.log(`[NexaCart Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[NexaCart Backend] Auth register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`[NexaCart Backend] Auth login: POST http://localhost:${PORT}/api/auth/login`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`[NexaCart Backend] Unhandled Rejection: ${err.message}`);
});

// Handle SIGTERM & SIGINT
process.on("SIGINT", () => {
  console.log("\n[NexaCart Backend] Shutting down gracefully...");
  server.close(() => {
    console.log("[NexaCart Backend] HTTP server closed.");
    process.exit(0);
  });
});

