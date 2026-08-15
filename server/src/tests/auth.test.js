const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

describe("Authentication API", () => {
  const testUser = {
    name: "Jest Test User",
    email: `jest_${Date.now()}@example.com`,
    password: "TestPassword123",
  };

  let token;

  afterAll(async () => {
    // Clean up test user
    await pool.query(
      "DELETE FROM users WHERE email = $1",
      [testUser.email]
    );

    await pool.end();
  });

  test("POST /api/users should create a new user", async () => {
    const response = await request(app)
      .post("/api/users")
      .send(testUser);

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toBe(testUser.name);
    expect(response.body.data.email).toBe(testUser.email);

    // Password should never be returned
    expect(response.body.data).not.toHaveProperty("password");
    expect(response.body.data).not.toHaveProperty(
      "password_hash"
    );
  });

  test("POST /api/users should reject duplicate email", async () => {
    const response = await request(app)
      .post("/api/users")
      .send(testUser);

    expect(response.statusCode).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "User with this email already exists"
    );
  });

  test("POST /api/auth/login should login successfully", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveProperty("token");

    expect(response.body.data.user.email).toBe(
      testUser.email
    );

    token = response.body.data.token;

    expect(token).toBeTruthy();
  });

  test("POST /api/auth/login should reject invalid password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword123",
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid Email or Password"
    );
  });

  test("POST /api/auth/login should reject missing credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);
  });
});