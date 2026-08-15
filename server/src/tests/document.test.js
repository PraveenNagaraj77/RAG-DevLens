const request = require("supertest");
const app = require("../app");

const { saveDocumentChunks } = require("../services/chunkService");

jest.mock("../services/chunkService", () => ({
  saveDocumentChunks: jest.fn(),
}));

describe("Document API", () => {
  let token;
  let projectId;

  const testEmail = `documenttest${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create test user
    await request(app)
      .post("/api/users")
      .send({
        name: "Document Test User",
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

    // Create project
    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Document Test Project",
        description: "Project created for document testing",
      });

    projectId = projectResponse.body.data.id;
  });

  beforeEach(() => {
    saveDocumentChunks.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/documents/projects/:projectId/upload", () => {
    test("should upload a document successfully", async () => {
      const response = await request(app)
        .post(`/api/documents/projects/${projectId}/upload`)
        .set("Authorization", `Bearer ${token}`)
        .attach(
          "file",
          Buffer.from(
            "This is a test document for DevLens."
          ),
          "test.txt"
        );

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Document uploaded successfully and processed successfully"
      );

      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.project_id).toBe(projectId);
      expect(response.body.data.file_name).toBe("test.txt");
      expect(response.body.data.file_type).toBe(".txt");

      expect(saveDocumentChunks).toHaveBeenCalledTimes(1);
    });

    test("should reject upload without a file", async () => {
      const response = await request(app)
        .post(`/api/documents/projects/${projectId}/upload`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should reject unauthenticated upload", async () => {
      const response = await request(app)
        .post(`/api/documents/projects/${projectId}/upload`)
        .attach(
          "file",
          Buffer.from("Unauthorized document"),
          "test.txt"
        );

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should return 404 for non-existent project", async () => {
      const fakeProjectId =
        "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .post(
          `/api/documents/projects/${fakeProjectId}/upload`
        )
        .set("Authorization", `Bearer ${token}`)
        .attach(
          "file",
          Buffer.from("Test document"),
          "test.txt"
        );

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);

      expect(saveDocumentChunks).not.toHaveBeenCalled();
    });

    test("should reject upload to another user's project", async () => {
      const anotherEmail = `anotherdocumenttest${Date.now()}@example.com`;

      // Create another user
      await request(app)
        .post("/api/users")
        .send({
          name: "Another Document User",
          email: anotherEmail,
          password: "Password@123",
        });

      // Login as another user
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: anotherEmail,
          password: "Password@123",
        });

      const anotherToken =
        loginResponse.body.data.token;

      const response = await request(app)
        .post(`/api/documents/projects/${projectId}/upload`)
        .set(
          "Authorization",
          `Bearer ${anotherToken}`
        )
        .attach(
          "file",
          Buffer.from("Unauthorized project document"),
          "test.txt"
        );

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);

      expect(saveDocumentChunks).not.toHaveBeenCalled();
    });

    test("should upload JavaScript file successfully", async () => {
      const javascriptContent = `
        const hello = () => {
          console.log("Hello DevLens");
        };
      `;

      const response = await request(app)
        .post(`/api/documents/projects/${projectId}/upload`)
        .set("Authorization", `Bearer ${token}`)
        .attach(
          "file",
          Buffer.from(javascriptContent),
          "app.js"
        );

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);

      expect(response.body.data.file_name).toBe("app.js");
      expect(response.body.data.file_type).toBe(".js");

      expect(saveDocumentChunks).toHaveBeenCalledTimes(1);
    });

    test("should handle document processing failure", async () => {
      saveDocumentChunks.mockRejectedValueOnce(
        new Error("Document processing failed")
      );

      const response = await request(app)
        .post(`/api/documents/projects/${projectId}/upload`)
        .set("Authorization", `Bearer ${token}`)
        .attach(
          "file",
          Buffer.from("Processing failure test"),
          "failure.txt"
        );

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});