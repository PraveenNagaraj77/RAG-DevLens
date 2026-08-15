const request = require("supertest");
const app = require("../app");

describe("Conversation API", () => {
  let token;
  let projectId;

  const testEmail = `conversationtest${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create test user
    await request(app)
      .post("/api/users")
      .send({
        name: "Conversation Test User",
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

    // Create test project
    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Conversation Test Project",
        description: "Project for conversation tests",
      });

    projectId = projectResponse.body.data.id;
  });

  describe("POST /api/conversations", () => {
    test("should create a conversation successfully", async () => {
      const response = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          projectId,
          title: "Test Conversation",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Conversation created successfully"
      );

      expect(response.body.data).toBeDefined();
      expect(response.body.data.project_id).toBe(projectId);
      expect(response.body.data.title).toBe(
        "Test Conversation"
      );
    });

    test("should create conversation with default title", async () => {
      const response = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          projectId,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.data.title).toBe(
        "New Conversation"
      );
    });

    test("should reject conversation without project ID", async () => {
      const response = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Missing Project",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should reject conversation with non-existent project", async () => {
      const fakeProjectId =
        "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          projectId: fakeProjectId,
          title: "Invalid Project",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("should reject unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/conversations")
        .send({
          projectId,
          title: "Unauthorized Conversation",
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should reject invalid project ID format", async () => {
      const response = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({
          projectId: "invalid-project-id",
          title: "Invalid Project ID",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
