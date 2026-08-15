const {
  generateEmbedding,
} = require("../services/embeddingService");

const {
  searchSimilarChunks,
} = require("../services/qdrantService");

const {
  retrieveRelevantChunks,
} = require("../services/retrievalService");

jest.mock("../services/embeddingService", () => ({
  generateEmbedding: jest.fn(),
}));

jest.mock("../services/qdrantService", () => ({
  searchSimilarChunks: jest.fn(),
}));

describe("Retrieval Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("retrieveRelevantChunks", () => {
    test("should generate embedding and retrieve relevant chunks", async () => {
      const queryVector = [0.1, 0.2, 0.3];

      const results = [
        {
          id: "chunk-1",
          score: 0.95,
          payload: {
            documentId: "document-1",
            projectId: "project-1",
            chunkIndex: 0,
            content: "React documentation",
          },
        },
      ];

      generateEmbedding.mockResolvedValueOnce(
        queryVector
      );

      searchSimilarChunks.mockResolvedValueOnce(
        results
      );

      const result = await retrieveRelevantChunks(
        "What is React?",
        "project-1"
      );

      expect(result).toEqual(results);

      expect(generateEmbedding).toHaveBeenCalledTimes(1);

      expect(generateEmbedding).toHaveBeenCalledWith(
        "What is React?"
      );

      expect(searchSimilarChunks).toHaveBeenCalledTimes(1);

      expect(searchSimilarChunks).toHaveBeenCalledWith(
        queryVector,
        "project-1",
        5
      );
    });

    test("should use custom limit", async () => {
      const queryVector = [0.1, 0.2, 0.3];

      generateEmbedding.mockResolvedValueOnce(
        queryVector
      );

      searchSimilarChunks.mockResolvedValueOnce([]);

      await retrieveRelevantChunks(
        "Find authentication code",
        "project-1",
        10
      );

      expect(searchSimilarChunks).toHaveBeenCalledWith(
        queryVector,
        "project-1",
        10
      );
    });

    test("should return empty array when no chunks are found", async () => {
      const queryVector = [0.1, 0.2, 0.3];

      generateEmbedding.mockResolvedValueOnce(
        queryVector
      );

      searchSimilarChunks.mockResolvedValueOnce([]);

      const result = await retrieveRelevantChunks(
        "Unknown information",
        "project-1"
      );

      expect(result).toEqual([]);

      expect(generateEmbedding).toHaveBeenCalledTimes(1);

      expect(searchSimilarChunks).toHaveBeenCalledTimes(1);
    });

    test("should propagate embedding generation errors", async () => {
      generateEmbedding.mockRejectedValueOnce(
        new Error("Embedding generation failed")
      );

      await expect(
        retrieveRelevantChunks(
          "What is React?",
          "project-1"
        )
      ).rejects.toThrow(
        "Embedding generation failed"
      );

      expect(generateEmbedding).toHaveBeenCalledTimes(1);

      expect(searchSimilarChunks).not.toHaveBeenCalled();
    });

    test("should propagate Qdrant search errors", async () => {
      const queryVector = [0.1, 0.2, 0.3];

      generateEmbedding.mockResolvedValueOnce(
        queryVector
      );

      searchSimilarChunks.mockRejectedValueOnce(
        new Error("Qdrant search failed")
      );

      await expect(
        retrieveRelevantChunks(
          "What is React?",
          "project-1"
        )
      ).rejects.toThrow(
        "Qdrant search failed"
      );

      expect(generateEmbedding).toHaveBeenCalledTimes(1);

      expect(searchSimilarChunks).toHaveBeenCalledTimes(1);
    });

    test("should pass the generated embedding to Qdrant", async () => {
      const queryVector = [
        0.123,
        0.456,
        0.789,
      ];

      generateEmbedding.mockResolvedValueOnce(
        queryVector
      );

      searchSimilarChunks.mockResolvedValueOnce([
        {
          id: "chunk-1",
          score: 0.88,
        },
      ]);

      await retrieveRelevantChunks(
        "authentication flow",
        "project-123",
        3
      );

      expect(searchSimilarChunks).toHaveBeenCalledWith(
        queryVector,
        "project-123",
        3
      );
    });
  });
});