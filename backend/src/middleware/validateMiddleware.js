const { validationResult } = require("express-validator");

/**
 * Middleware to intercept express-validator results and format standardized error responses
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const primaryMessage = errorList.map((err) => err.msg).join(", ");

    return res.status(400).json({
      success: false,
      message: primaryMessage,
      errors: errorList.map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;

