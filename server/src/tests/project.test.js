const request = require("supertest");
const app = require("../app");

const pool = require("../config/db");

describe("Project API", () => {
  let token;
  let projectId;

  const testEmail = `projecttest${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create test user
    await request(app)
      .post("/api/users")
      .send({
        name: "Project Test User",
        email: testEmail,
        password: "Password@123",
      });

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "Password@123",
      });

    token = loginResponse.body.data.token;
  });

  describe("POST /api/projects", () => {
    test("should create a project", async () => {
      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Project",
          description: "Project created for testing",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Project");

      projectId = response.body.data.id;
    });

    test("should reject project without name", async () => {
      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Missing project name",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should reject unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/projects")
        .send({
          name: "Unauthorized Project",
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/projects", () => {
    test("should return user's projects", async () => {
      const response = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/projects/:id", () => {
    test("should return project by ID", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(projectId);
    });

    test("should return 404 for non-existent project", async () => {
      const fakeProjectId =
        "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .get(`/api/projects/${fakeProjectId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/projects/:id", () => {
    test("should update project", async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Test Project",
          description: "Updated description",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(
        "Updated Test Project"
      );
    });

    test("should reject update without name", async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Missing name",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/projects/:id", () => {
    test("should delete project", async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 404 after deletion", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});