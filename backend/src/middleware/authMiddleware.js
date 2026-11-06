const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes: verify JWT Bearer token and attach authenticated user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract Bearer token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "nexacart_jwt_super_secret_key_2026_production_grade"
      );

      // Attach user object to request (excluding password)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account no longer exists. Please sign in again.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account has been deactivated. Please contact support.",
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Your authentication token has expired. Please sign in again."
            : "Not authorized. Invalid authentication token.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required. Please sign in to access this resource.",
    });
  }
};

/**
 * Restrict access to specified roles (e.g., admin, manager)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following permissions: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};

