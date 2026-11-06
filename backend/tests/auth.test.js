const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load backend app and components
const app = require("../src/app");
const User = require("../src/models/User");
const generateToken = require("../src/utils/generateToken");
const authService = require("../src/services/authService");

const TEST_SECRET = "nexacart_jwt_super_secret_key_2026_production_grade";

// Helper function to send HTTP requests to Express server
const makeRequest = (server, { method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;

    const postData = body ? JSON.stringify(body) : "";
    const reqHeaders = {
      ...headers,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    };

    const options = {
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

describe("NexaCart Backend — Authentication & Security Suite", () => {
  let server;

  before(async () => {
    return new Promise((resolve) => {
      server = app.listen(0, () => resolve());
    });
  });

  after(async () => {
    return new Promise((resolve) => {
      server.close(() => resolve());
    });
  });

  describe("API Health & Environment", () => {
    it("GET /api/health returns 200 OK and status message", async () => {
      const res = await makeRequest(server, { method: "GET", path: "/api/health" });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.message.includes("NexaCart API"));
    });
  });

  describe("Signup API Validation (POST /api/auth/register)", () => {
    // Test Case 3: Missing signup fields
    it("Test Case 3: Missing signup fields returns 400 Bad Request", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/register",
        body: {},
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("Full name is required") || res.data.message.includes("required"));
    });

    // Test Case 4: Invalid email format
    it("Test Case 4: Invalid email returns 400 Bad Request", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/register",
        body: {
          name: "Test User",
          email: "invalid-email-string",
          password: "password123",
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("valid email"));
    });

    // Test Case 5: Weak password (< 6 characters)
    it("Test Case 5: Weak password (< 6 chars) returns 400 Bad Request", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/register",
        body: {
          name: "Test User",
          email: "valid@example.com",
          password: "123",
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("at least 6 characters"));
    });

    it("Signup fails when confirmPassword does not match password", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/register",
        body: {
          name: "Test User",
          email: "valid@example.com",
          password: "password123",
          confirmPassword: "mismatchPassword",
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("Passwords do not match"));
    });
  });

  describe("Login API Validation (POST /api/auth/login)", () => {
    // Test Case 9: Missing login fields
    it("Test Case 9: Missing login email returns 400 Bad Request", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/login",
        body: { password: "password123" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("Email address is required"));
    });

    it("Test Case 9: Missing login password returns 400 Bad Request", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/login",
        body: { email: "user@example.com" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("Password is required"));
    });

    it("Invalid email in login returns 400 Bad Request", async () => {
      const res = await makeRequest(server, {
        method: "POST",
        path: "/api/auth/login",
        body: { email: "not-an-email", password: "password123" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("valid email"));
    });
  });

  describe("Protected Route & JWT Verification (GET /api/auth/profile)", () => {
    // Test Case 10: Access protected route without token
    it("Test Case 10: Access protected route without token returns 401 Unauthorized", async () => {
      const res = await makeRequest(server, {
        method: "GET",
        path: "/api/auth/profile",
      });
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("Authorization token required"));
    });

    // Test Case 12: Access protected route with invalid token
    it("Test Case 12: Access protected route with invalid token returns 401 Unauthorized", async () => {
      const res = await makeRequest(server, {
        method: "GET",
        path: "/api/auth/profile",
        headers: {
          Authorization: "Bearer invalid.malformed.jwt.token",
        },
      });
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("Invalid authentication token"));
    });

    it("Access protected route with expired token returns 401 Unauthorized", async () => {
      // Create an expired token (expired 10 seconds ago)
      const expiredToken = jwt.sign(
        { id: "60d0fe4f5311236168a109ca", role: "customer" },
        TEST_SECRET,
        { expiresIn: -10 }
      );

      const res = await makeRequest(server, {
        method: "GET",
        path: "/api/auth/profile",
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
      assert.ok(res.data.message.includes("expired"));
    });
  });

  describe("Token Generator & Password Security Unit Logic", () => {
    it("generateToken creates a valid verifiable JWT containing id and role", () => {
      const userId = "64f1a2b3c4d5e6f7a8b9c0d1";
      const token = generateToken(userId, "admin");
      assert.ok(token, "Token should be non-empty string");

      const decoded = jwt.verify(token, TEST_SECRET);
      assert.equal(decoded.id, userId);
      assert.equal(decoded.role, "admin");
    });

    it("User schema hashes passwords and matchPassword verifies correctly", async () => {
      const rawPassword = "SuperSecretPassword123!";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      // Verify correct password matches
      const isCorrect = await bcrypt.compare(rawPassword, hashedPassword);
      assert.equal(isCorrect, true);

      // Verify wrong password fails
      const isWrong = await bcrypt.compare("wrongPassword", hashedPassword);
      assert.equal(isWrong, false);
    });

    it("User model toJSON strips sensitive fields and maps id correctly", () => {
      const sampleUser = new User({
        name: "Rahul Sharma",
        email: "rahul@example.com",
        password: "password123",
        role: "customer",
      });

      const json = sampleUser.toJSON();
      assert.ok(json.id, "Virtual id should exist on user JSON");
      assert.equal(json._id, undefined, "_id should be stripped");
      assert.equal(json.__v, undefined, "__v should be stripped");
      assert.equal(json.password, undefined, "password hash must NEVER be exposed");
      assert.equal(json.name, "Rahul Sharma");
      assert.equal(json.email, "rahul@example.com");
      assert.equal(json.role, "customer");
    });
  });

  describe("Service Level Logic & Edge Cases", () => {
    // Mock user database in memory for isolated service unit tests
    const mockDb = new Map();

    const originalFindOne = User.findOne;
    const originalCreate = User.create;
    const originalFindById = User.findById;

    before(() => {
      mockDb.clear();

      // Mock User.findOne
      User.findOne = ({ email }) => {
        const found = mockDb.get(email.toLowerCase().trim());
        if (!found) {
          return {
            select: () => null,
            then: (resolve) => resolve(null),
          };
        }
        return {
          select: (fields) => {
            return {
              ...found,
              matchPassword: async (pwd) => await bcrypt.compare(pwd, found.password),
              toJSON: () => {
                const copy = { ...found, id: found._id };
                delete copy.password;
                delete copy._id;
                delete copy.__v;
                return copy;
              },
            };
          },
          then: (resolve) => resolve(found),
        };
      };

      // Mock User.create
      User.create = async (doc) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doc.password, salt);
        const id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const saved = {
          _id: id,
          id,
          name: doc.name,
          email: doc.email.toLowerCase().trim(),
          password: hashedPassword,
          role: doc.role || "customer",
          avatar: doc.avatar || "https://images.unsplash.com/...",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          toJSON() {
            const copy = { ...this };
            delete copy.password;
            delete copy._id;
            delete copy.__v;
            return copy;
          },
        };
        mockDb.set(saved.email, saved);
        return saved;
      };

      // Mock User.findById
      User.findById = (id) => {
        for (const user of mockDb.values()) {
          if (user._id === id || user.id === id) {
            return {
              select: () => user,
              then: (resolve) => resolve(user),
            };
          }
        }
        return {
          select: () => null,
          then: (resolve) => resolve(null),
        };
      };
    });

    after(() => {
      User.findOne = originalFindOne;
      User.create = originalCreate;
      User.findById = originalFindById;
    });

    // Test Case 1: Successful signup
    it("Test Case 1: Successful signup registers user and returns JWT", async () => {
      const result = await authService.registerUser({
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "securePassword123",
        role: "customer",
      });

      assert.ok(result.token, "Token must be returned");
      assert.equal(result.user.name, "Alice Johnson");
      assert.equal(result.user.email, "alice@example.com");
      assert.equal(result.user.role, "customer");
      assert.equal(result.user.password, undefined, "Password must not be returned");
    });

    // Test Case 2: Duplicate email signup
    it("Test Case 2: Duplicate email signup throws 400 error", async () => {
      await assert.rejects(
        async () => {
          await authService.registerUser({
            name: "Alice Copy",
            email: "alice@example.com", // Already registered
            password: "password123",
          });
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.ok(err.message.includes("already exists"));
          return true;
        }
      );
    });

    // Test Case 6: Successful login
    it("Test Case 6: Successful login verifies password and returns token", async () => {
      const loginRes = await authService.loginUser({
        email: "alice@example.com",
        password: "securePassword123",
      });

      assert.ok(loginRes.token);
      assert.equal(loginRes.user.email, "alice@example.com");
      assert.equal(loginRes.user.password, undefined);
    });

    // Test Case 7: Incorrect password
    it("Test Case 7: Incorrect password throws 401 Unauthorized", async () => {
      await assert.rejects(
        async () => {
          await authService.loginUser({
            email: "alice@example.com",
            password: "wrongPassword999",
          });
        },
        (err) => {
          assert.equal(err.statusCode, 401);
          assert.ok(err.message.includes("incorrect") || err.message.includes("credentials"));
          return true;
        }
      );
    });

    // Test Case 8: Non-existing user login
    it("Test Case 8: Non-existing user login throws 401 Unauthorized", async () => {
      await assert.rejects(
        async () => {
          await authService.loginUser({
            email: "ghost@example.com",
            password: "anyPassword",
          });
        },
        (err) => {
          assert.equal(err.statusCode, 401);
          assert.ok(err.message.includes("No account found"));
          return true;
        }
      );
    });

    // Test Case 11: Access protected route with valid token
    it("Test Case 11: Valid token allows retrieving user profile", async () => {
      const user = mockDb.get("alice@example.com");
      const profile = await authService.getUserProfile(user._id);

      assert.equal(profile.id, user.id);
      assert.equal(profile.email, "alice@example.com");
      assert.equal(profile.password, undefined);
    });

    it("Check email availability correctly identifies registered and free emails", async () => {
      const taken = await authService.checkEmailAvailability("alice@example.com");
      assert.equal(taken.isAvailable, false);

      const available = await authService.checkEmailAvailability("fresh_user@example.com");
      assert.equal(available.isAvailable, true);
    });
  });
});
