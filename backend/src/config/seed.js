const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[Seed] Connected to MongoDB Atlas...");

    const defaultUsers = [
      {
        name: "Alex Vance (Admin)",
        email: "admin@nexacart.com",
        password: "changeme123",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      {
        name: "Sarah Connor (Manager)",
        email: "manager@nexacart.com",
        password: "changeme123",
        role: "manager",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
      {
        name: "John Doe (Customer)",
        email: "customer@nexacart.com",
        password: "changeme123",
        role: "customer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`[Seed] Created ${userData.role} user: ${userData.email}`);
      } else {
        console.log(`[Seed] User already exists: ${userData.email}`);
      }
    }

    console.log("[Seed] Default database accounts initialized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Failed to seed accounts:", error.message);
    process.exit(1);
  }
};

seedUsers();

