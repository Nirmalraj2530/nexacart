const jwt = require("jsonwebtoken");

/**
 * Generate a JSON Web Token for authenticated users
 * @param {string} id - User ID
 * @param {string} role - User role (customer, manager, admin)
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role = "customer") => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "nexacart_jwt_super_secret_key_2026_production_grade",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

module.exports = generateToken;

