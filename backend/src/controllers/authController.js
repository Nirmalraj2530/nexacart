const authService = require("../services/authService");
const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");
const generateToken = require("../utils/generateToken");
const { extractBearerToken } = require("../middleware/authMiddleware");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      avatar,
      role: "customer",
    });

    // Return hybrid response supporting both RTK Query expectations and clean REST format
    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to NexaCart.",
      access_token: token,
      token,
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
 * @desc    Authenticate user & get encrypted JWT token
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
 * @desc    Update current logged-in user profile & preferences
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, avatar, currency, emailNotifications, smsNotifications } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const exists = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({ success: false, message: "Email address is already in use." });
      }
      user.email = normalizedEmail;
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (avatar !== undefined && avatar !== "") user.avatar = avatar;

    user.preferences = {
      currency: currency || user.preferences?.currency || "USD",
      emailNotifications:
        emailNotifications !== undefined
          ? Boolean(emailNotifications)
          : user.preferences?.emailNotifications ?? true,
      smsNotifications:
        smsNotifications !== undefined
          ? Boolean(smsNotifications)
          : user.preferences?.smsNotifications ?? false,
    };

    const saved = await user.save();
    const userObj = saved.toJSON();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: userObj,
      ...userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password for current logged-in user
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current password and new password are required.",
      });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    // Issue a fresh encrypted token after password change
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      access_token: token,
      token,
    });
  } catch (error) {
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
 * @desc    Refresh access token (revokes old jti if possible and returns fresh encrypted token)
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
const refreshToken = async (req, res, next) => {
  try {
    if (req.tokenPayload?.jti && req.tokenPayload?.exp && RevokedToken.db?.readyState === 1) {
      await RevokedToken.updateOne(
        { jti: req.tokenPayload.jti },
        { jti: req.tokenPayload.jti, expiresAt: new Date(req.tokenPayload.exp * 1000) },
        { upsert: true }
      );
    }

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
 * @desc    Logout user & revoke active encrypted token
 * @route   POST /api/auth/logout
 * @access  Public (best-effort token revocation when Bearer token is present)
 */
const logout = async (req, res) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const decoded = generateToken.verifyToken(token);
      if (decoded?.jti && decoded?.exp && RevokedToken.db?.readyState === 1) {
        await RevokedToken.updateOne(
          { jti: decoded.jti },
          { jti: decoded.jti, expiresAt: new Date(decoded.exp * 1000) },
          { upsert: true }
        );
      }
    }
  } catch {
    // Ignore expired/invalid tokens on logout so client sign-out always succeeds
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  checkAvailability,
  refreshToken,
  logout,
};
