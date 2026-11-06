const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, avatar, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("An account with this email already exists. Please sign in instead.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Create user document
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    avatar: avatar || undefined,
    role: role || "customer",
  });

  // 3. Generate token
  const token = generateToken(user._id, user.role);

  // 4. Convert user to JSON object (strips password & __v via schema transform)
  const userObj = user.toJSON();

  return {
    user: userObj,
    token,
  };
};

/**
 * Authenticate user credentials & return token
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user by email, explicitly including password field for verification
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    const error = new Error("No account found with this email, or the password is incorrect. Please verify your credentials.");
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify account status
  if (!user.isActive) {
    const error = new Error("This account has been deactivated. Please contact customer support.");
    error.statusCode = 403;
    throw error;
  }

  // 3. Compare password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error("No account found with this email, or the password is incorrect. Please verify your credentials.");
    error.statusCode = 401;
    throw error;
  }

  // 4. Generate JWT
  const token = generateToken(user._id, user.role);

  // 5. Convert to clean JSON object
  const userObj = user.toJSON();

  return {
    user: userObj,
    token,
  };
};

/**
 * Retrieve user profile by user ID
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

/**
 * Check whether an email is available for registration
 */
const checkEmailAvailability = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  return {
    isAvailable: !existingUser,
    email: normalizedEmail,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  checkEmailAvailability,
};

