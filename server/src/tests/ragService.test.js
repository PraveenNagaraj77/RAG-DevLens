const {
  retrieveRelevantChunks,
} = require("../services/retrievalService");

const {
  generateAnswer,
} = require("../services/llmService");

const {
  generateRAGAnswer,
} = require("../services/ragService");

jest.mock("../services/retrievalService", () => ({
  retrieveRelevantChunks: jest.fn(),
}));

jest.mock("../services/llmService", () => ({
  generateAnswer: jest.fn(),
}));

describe("RAG Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateRAGAnswer", () => {
    test("should generate an answer using relevant chunks", async () => {
      const results = [
        {
          score: 0.95,
          payload: {
            documentId: "document-1",
            projectId: "project-1",
            chunkIndex: 0,
            content: "React is used for building user interfaces.",
          },
        },
        {
          score: 0.89,
          payload: {
            documentId: "document-2",
            projectId: "project-1",
            chunkIndex: 2,
            content: "Node.js is used for backend development.",
          },
        },
      ];

      retrieveRelevantChunks.mockResolvedValueOnce(results);

      generateAnswer.mockResolvedValueOnce(
        "React is used for the frontend and Node.js is used for the backend."
      );

      const result = await generateRAGAnswer(
        "What technologies are used?",
        "project-1"
      );

      expect(result.answer).toBe(
        "React is used for the frontend and Node.js is used for the backend."
      );

      expect(result.sources).toEqual([
        {
          documentId: "document-1",
          projectId: "project-1",
          chunkIndex: 0,
          score: 0.95,
        },
        {
          documentId: "document-2",
          projectId: "project-1",
          chunkIndex: 2,
          score: 0.89,
        },
      ]);

      expect(retrieveRelevantChunks).toHaveBeenCalledTimes(1);

      expect(retrieveRelevantChunks).toHaveBeenCalledWith(
        "What technologies are used?",
        "project-1",
        5
      );

      expect(generateAnswer).toHaveBeenCalledTimes(1);

      expect(generateAnswer).toHaveBeenCalledWith(
        "What technologies are used?",
        expect.stringContaining(
          "React is used for building user interfaces."
        ),
        []
      );
    });

    test("should use custom history when provided", async () => {
      const results = [
        {
          score: 0.91,
          payload: {
            documentId: "document-1",
            projectId: "project-1",
            chunkIndex: 0,
            content: "DevLens uses React for the frontend.",
          },
        },
      ];

      const history = [
        {
          role: "user",
          content: "What frontend framework does DevLens use?",
        },
        {
          role: "assistant",
          content: "DevLens uses React.",
        },
      ];

      retrieveRelevantChunks.mockResolvedValueOnce(results);

      generateAnswer.mockResolvedValueOnce(
        "DevLens uses React."
      );

      const result = await generateRAGAnswer(
        "What about the frontend?",
        "project-1",
        history
      );

      expect(result.answer).toBe(
        "DevLens uses React."
      );

      expect(generateAnswer).toHaveBeenCalledWith(
        "What about the frontend?",
        expect.any(String),
        history
      );
    });

    test("should return fallback response when no relevant chunks are found", async () => {
      retrieveRelevantChunks.mockResolvedValueOnce([]);

      const result = await generateRAGAnswer(
        "What is this project?",
        "project-1"
      );

      expect(result).toEqual({
        answer:
          "I couldn't find relevant information in the provided project documentation.",
        sources: [],
      });

      expect(retrieveRelevantChunks).toHaveBeenCalledTimes(1);

      expect(generateAnswer).not.toHaveBeenCalled();
    });

    test("should use custom retrieval limit", async () => {
      const results = [
        {
          score: 0.98,
          payload: {
            documentId: "document-1",
            projectId: "project-1",
            chunkIndex: 0,
            content: "Relevant documentation.",
          },
        },
      ];

      retrieveRelevantChunks.mockResolvedValueOnce(results);

      generateAnswer.mockResolvedValueOnce(
        "Relevant answer."
      );

      await generateRAGAnswer(
        "Test question",
        "project-1",
        [],
        10
      );

      expect(retrieveRelevantChunks).toHaveBeenCalledWith(
        "Test question",
        "project-1",
        10
      );
    });

    test("should build context from all retrieved chunks", async () => {
      const results = [
        {
          score: 0.9,
          payload: {
            documentId: "document-1",
            projectId: "project-1",
            chunkIndex: 0,
            content: "First documentation chunk.",
          },
        },
        {
          score: 0.8,
          payload: {
            documentId: "document-2",
            projectId: "project-1",
            chunkIndex: 1,
            content: "Second documentation chunk.",
          },
        },
        {
          score: 0.7,
          payload: {
            documentId: "document-3",
            projectId: "project-1",
            chunkIndex: 2,
            content: "Third documentation chunk.",
          },
        },
      ];

      retrieveRelevantChunks.mockResolvedValueOnce(results);

      generateAnswer.mockResolvedValueOnce(
        "Combined answer."
      );

      await generateRAGAnswer(
        "Explain the project.",
        "project-1"
      );

      const context =
        generateAnswer.mock.calls[0][1];

      expect(context).toContain(
        "Source 1:"
      );

      expect(context).toContain(
        "First documentation chunk."
      );

      expect(context).toContain(
        "Source 2:"
      );

      expect(context).toContain(
        "Second documentation chunk."
      );

      expect(context).toContain(
        "Source 3:"
      );

      expect(context).toContain(
        "Third documentation chunk."
      );
    });

    test("should propagate retrieval errors", async () => {
      retrieveRelevantChunks.mockRejectedValueOnce(
        new Error("Retrieval failed")
      );

      await expect(
        generateRAGAnswer(
          "What is DevLens?",
          "project-1"
        )
      ).rejects.toThrow("Retrieval failed");

      expect(generateAnswer).not.toHaveBeenCalled();
    });

    test("should propagate LLM generation errors", async () => {
      const results = [
        {
          score: 0.95,
          payload: {
            documentId: "document-1",
            projectId: "project-1",
            chunkIndex: 0,
            content: "DevLens documentation.",
          },
        },
      ];

      retrieveRelevantChunks.mockResolvedValueOnce(results);

      generateAnswer.mockRejectedValueOnce(
        new Error("LLM generation failed")
      );

      await expect(
        generateRAGAnswer(
          "Explain DevLens.",
          "project-1"
        )
      ).rejects.toThrow(
        "LLM generation failed"
      );

      expect(generateAnswer).toHaveBeenCalledTimes(1);
    });
  });
});