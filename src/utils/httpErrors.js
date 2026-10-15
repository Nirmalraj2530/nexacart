/**
 * HTTP Status Code Dictionary & Normalization Helper for NexaCart
 * Handles 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 
 * 403 Forbidden, 404 Not Found, and 500 Internal Server Error.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Returns human-readable error titles and messages for HTTP status codes.
 *
 * @param {number|string} statusCode
 * @param {string} [customMessage]
 * @returns {{ code: number, name: string, category: string, title: string, message: string }}
 */
export function getHttpStatusDetails(statusCode, customMessage) {
  const code = Number(statusCode);

  switch (code) {
    case HTTP_STATUS.OK:
      return {
        code: 200,
        name: "OK",
        category: "success",
        title: "Request Successful",
        message: customMessage || "The operation completed successfully.",
      };

    case HTTP_STATUS.CREATED:
      return {
        code: 201,
        name: "Created",
        category: "success",
        title: "Resource Created",
        message: customMessage || "The item was successfully created.",
      };

    case HTTP_STATUS.BAD_REQUEST:
      return {
        code: 400,
        name: "Bad Request",
        category: "client_error",
        title: "Invalid Request (400)",
        message:
          customMessage ||
          "The server could not process the request due to invalid input or syntax.",
      };

    case HTTP_STATUS.UNAUTHORIZED:
      return {
        code: 401,
        name: "Unauthorized",
        category: "auth_error",
        title: "Authentication Required (401)",
        message:
          customMessage ||
          "Your session has expired or credentials are invalid. Please sign in.",
      };

    case HTTP_STATUS.FORBIDDEN:
      return {
        code: 403,
        name: "Forbidden",
        category: "permission_error",
        title: "Access Forbidden (403)",
        message:
          customMessage ||
          "You do not have the required permissions to perform this action.",
      };

    case HTTP_STATUS.NOT_FOUND:
      return {
        code: 404,
        name: "Not Found",
        category: "client_error",
        title: "Not Found (404)",
        message:
          customMessage ||
          "The requested product, user, or category does not exist or has been removed.",
      };

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return {
        code: 500,
        name: "Internal Server Error",
        category: "server_error",
        title: "Server Error (500)",
        message:
          customMessage ||
          "The server encountered an unexpected error. Please try again shortly.",
      };

    default:
      return {
        code: code || 0,
        name: "Error",
        category: "unknown",
        title: "Unexpected Error",
        message: customMessage || "An unexpected error occurred. Please try again.",
      };
  }
}

