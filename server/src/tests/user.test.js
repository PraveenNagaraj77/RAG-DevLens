const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const pool = require("../config/db");
const env = require("../config/env");

describe("Users API", () => {
  const testEmail = `testuser_${Date.now()}@example.com`;

  let token;

  beforeAll(() => {
    token = jwt.sign(
      {
        userId: "00000000-0000-0000-0000-000000000001",
        email: testEmail,
      },
      env.jwt.secret,
      {
        expiresIn: "1h",
      }
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("POST /api/users", () => {
    test("should create a new user", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({
          name: "Test User",
          email: testEmail,
          password: "Password@123",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe(testEmail);
    });

    test("should reject duplicate email", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({
          name: "Another User",
          email: testEmail,
          password: "Password@123",
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "User with this email already exists"
      );
    });

    test("should reject missing required fields", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({
          email: `missing_${Date.now()}@example.com`,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/users/profile", () => {
    test("should reject request without authentication", async () => {
      const response = await request(app)
        .get("/api/users/profile");

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should accept authenticated request", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty("userId");
      expect(response.body.user).toHaveProperty("email");
    });
  });
});