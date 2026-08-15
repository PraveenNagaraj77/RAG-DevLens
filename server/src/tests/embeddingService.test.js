const gemini = require("../config/gemini");

const {
  EMBEDDING_MODEL,
  generateEmbedding,
} = require("../services/embeddingService");

jest.mock("../config/gemini", () => ({
  models: {
    embedContent: jest.fn(),
  },
}));

describe("Embedding Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateEmbedding", () => {
    test("should generate embedding successfully", async () => {
      const embedding = [0.1, 0.2, 0.3, 0.4];

      gemini.models.embedContent.mockResolvedValueOnce({
        embeddings: [
          {
            values: embedding,
          },
        ],
      });

      const result = await generateEmbedding(
        "What is React?"
      );

      expect(result).toEqual(embedding);

      expect(
        gemini.models.embedContent
      ).toHaveBeenCalledTimes(1);

      expect(
        gemini.models.embedContent
      ).toHaveBeenCalledWith({
        model: EMBEDDING_MODEL,
        contents: "What is React?",
        config: {
          outputDimensionality: 768,
        },
      });
    });

    test("should generate embedding for code content", async () => {
      const embedding = [
        0.11,
        0.22,
        0.33,
      ];

      const code = `
const add = (a, b) => {
  return a + b;
};
`;

      gemini.models.embedContent.mockResolvedValueOnce({
        embeddings: [
          {
            values: embedding,
          },
        ],
      });

      const result = await generateEmbedding(code);

      expect(result).toEqual(embedding);

      expect(
        gemini.models.embedContent
      ).toHaveBeenCalledWith({
        model: EMBEDDING_MODEL,
        contents: code,
        config: {
          outputDimensionality: 768,
        },
      });
    });

    test("should return the first embedding values", async () => {
      const firstEmbedding = [0.1, 0.2];

      gemini.models.embedContent.mockResolvedValueOnce({
        embeddings: [
          {
            values: firstEmbedding,
          },
          {
            values: [0.9, 0.8],
          },
        ],
      });

      const result = await generateEmbedding(
        "Test content"
      );

      expect(result).toEqual(firstEmbedding);
    });

    test("should propagate Gemini API errors", async () => {
      gemini.models.embedContent.mockRejectedValueOnce(
        new Error("Gemini embedding failed")
      );

      await expect(
        generateEmbedding("Test content")
      ).rejects.toThrow(
        "Gemini embedding failed"
      );

      expect(
        gemini.models.embedContent
      ).toHaveBeenCalledTimes(1);
    });

    test("should use the configured embedding model", async () => {
      gemini.models.embedContent.mockResolvedValueOnce({
        embeddings: [
          {
            values: [0.1, 0.2],
          },
        ],
      });

      await generateEmbedding(
        "DevLens documentation"
      );

      expect(
        gemini.models.embedContent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          model: EMBEDDING_MODEL,
        })
      );
    });

    test("should request 768-dimensional embeddings", async () => {
      gemini.models.embedContent.mockResolvedValueOnce({
        embeddings: [
          {
            values: [0.1, 0.2],
          },
        ],
      });

      await generateEmbedding(
        "DevLens documentation"
      );

      expect(
        gemini.models.embedContent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          config: {
            outputDimensionality: 768,
          },
        })
      );
    });
  });
});