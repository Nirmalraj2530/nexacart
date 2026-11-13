const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const runAutoSeed = require("./autoSeed");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[Seed] Connected to MongoDB Atlas...");
    await runAutoSeed();
    console.log("[Seed] Database initialized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Failed to seed database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
