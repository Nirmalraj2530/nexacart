const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");
const { verifyToken } = require("../utils/generateToken");

/**
 * Extract Bearer token from Authorization header.
 */
const extractBearerToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

/**
 * Protect routes: verify encrypted JWT Bearer token, ensure it is not revoked, and attach req.user
 */
const protect = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required. Please sign in to access this resource.",
    });
  }

  try {
    const decoded = verifyToken(token);

    // Check revocation list when DB is connected and token has jti
    if (decoded?.jti && RevokedToken.db?.readyState === 1) {
      const revoked = await RevokedToken.exists({ jti: decoded.jti });
      if (revoked) {
        return res.status(401).json({
          success: false,
          message: "Session has been logged out. Please sign in again.",
        });
      }
    }

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
    req.tokenPayload = decoded;
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
};

/**
 * Optional auth middleware: attaches req.user when a valid Bearer token is present, otherwise proceeds cleanly.
 */
const optionalProtect = async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    if (decoded?.jti && RevokedToken.db?.readyState === 1) {
      const revoked = await RevokedToken.exists({ jti: decoded.jti });
      if (revoked) return next();
    }
    const user = await User.findById(decoded.id).select("-password");
    if (user && user.isActive) {
      req.user = user;
      req.tokenPayload = decoded;
    }
  } catch {
    // Ignore invalid/expired optional tokens
  }
  return next();
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
  optionalProtect,
  authorize,
  extractBearerToken,
};
