const request = require("supertest");
const app = require("../app");

describe("404 Handler", () => {
  test("should return 404 for unknown route", async () => {
    const response = await request(app)
      .get("/api/does-not-exist");

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Route not found: GET /api/does-not-exist"
    );
  });
});