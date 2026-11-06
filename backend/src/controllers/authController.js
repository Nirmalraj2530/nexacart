const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar, role } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      avatar,
      role,
    });

    // Return hybrid response supporting both RTK Query expectations and clean REST format
    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to NexaCart.",
      access_token: token,
      token,
      user,
      ...user, // Spreads id, name, email, role, avatar at root level for seamless frontend compatibility
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Signed in successfully. Welcome back!",
      access_token: token,
      token,
      user,
      ...user, // Spreads id, name, email, role, avatar at root level
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Bearer Token required)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);

    return res.status(200).json({
      success: true,
      user,
      ...user,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * @desc    Check if an email is available for registration
 * @route   POST /api/auth/check-email (also aliased at /api/users/is-available)
 * @access  Public
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.checkEmailAvailability(email);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = generateToken(req.user._id, req.user.role);
    return res.status(200).json({
      success: true,
      access_token: token,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (clears session context)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

module.exports = {
  register,
  login,
  getProfile,
  checkAvailability,
  refreshToken,
  logout,
};

