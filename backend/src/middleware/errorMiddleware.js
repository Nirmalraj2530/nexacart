/**
 * Centralized Error Handling Middlewares for NexaCart
 */

// Handle 404 Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account with this ${field} already exists. Please sign in instead.`;
  }

  // Handle Mongoose Schema Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((val) => val.message);
    message = errors.join(", ");
  }

  // Handle JWT Invalid Token
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please sign in again.";
  }

  // Handle JWT Expired Token
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your authentication session has expired. Please sign in again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};

