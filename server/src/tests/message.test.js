const request = require("supertest");
const app = require("../app");

const { generateRAGAnswer } = require("../services/ragService");

jest.mock("../services/ragService", () => ({
  generateRAGAnswer: jest.fn(),
}));

describe("Message API", () => {
  let token;
  let conversationId;
  let projectId;

  const testEmail = `messagetest${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create test user
    await request(app)
      .post("/api/users")
      .send({
        name: "Message Test User",
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
        name: "Message Test Project",
        description: "Project for message tests",
      });

    projectId = projectResponse.body.data.id;

    // Create conversation
    const conversationResponse = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId,
        title: "Message Test Conversation",
      });

    conversationId =
      conversationResponse.body.data.id;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/messages/:conversationId", () => {
    test("should process a message successfully", async () => {
      generateRAGAnswer.mockResolvedValueOnce({
        answer: "This is a mocked RAG answer.",
        sources: [
          {
            documentId: "document-123",
            fileName: "README.md",
          },
        ],
      });

      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "Explain this project.",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.message).toBe(
        "Message processed successfully"
      );

      expect(response.body.data).toBeDefined();

      expect(
        response.body.data.userMessage
      ).toBeDefined();

      expect(
        response.body.data.userMessage.role
      ).toBe("user");

      expect(
        response.body.data.userMessage.content
      ).toBe("Explain this project.");

      expect(
        response.body.data.assistantMessage
      ).toBeDefined();

      expect(
        response.body.data.assistantMessage.role
      ).toBe("assistant");

      expect(
        response.body.data.assistantMessage.content
      ).toBe("This is a mocked RAG answer.");

      expect(response.body.data.sources).toEqual([
        {
          documentId: "document-123",
          fileName: "README.md",
        },
      ]);

      expect(generateRAGAnswer).toHaveBeenCalledTimes(1);

      expect(generateRAGAnswer).toHaveBeenCalledWith(
        "Explain this project.",
        projectId,
        []
      );
    });

    test("should trim the user message", async () => {
      generateRAGAnswer.mockResolvedValueOnce({
        answer: "Trimmed message response.",
        sources: [],
      });

      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "   Hello DevLens   ",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      expect(
        response.body.data.userMessage.content
      ).toBe("Hello DevLens");

      expect(generateRAGAnswer).toHaveBeenCalledWith(
        "Hello DevLens",
        projectId,
        expect.any(Array)
      );
    });

    test("should reject request without message", async () => {
      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).not.toHaveBeenCalled();
    });

    test("should reject empty message", async () => {
      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).not.toHaveBeenCalled();
    });

    test("should reject whitespace-only message", async () => {
      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "     ",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).not.toHaveBeenCalled();
    });

    test("should return 404 for non-existent conversation", async () => {
      const fakeConversationId =
        "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .post(`/api/messages/${fakeConversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "Hello DevLens",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).not.toHaveBeenCalled();
    });

    test("should reject unauthenticated request", async () => {
      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .send({
          message: "Unauthorized message",
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).not.toHaveBeenCalled();
    });

    test("should reject invalid conversation ID format", async () => {
      const response = await request(app)
        .post("/api/messages/invalid-conversation-id")
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "Invalid conversation ID",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).not.toHaveBeenCalled();
    });

    test("should return 500 when RAG processing fails", async () => {
      generateRAGAnswer.mockRejectedValueOnce(
        new Error("RAG processing failed")
      );

      const response = await request(app)
        .post(`/api/messages/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          message: "Trigger RAG failure",
        });

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);

      expect(generateRAGAnswer).toHaveBeenCalledTimes(1);
    });
  });
});