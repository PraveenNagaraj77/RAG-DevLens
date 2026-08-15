jest.mock("../repositories/chunkRepository", () => ({
  getChunksByDocumentId: jest.fn(),
}));

jest.mock("../services/embeddingService", () => ({
  generateEmbedding: jest.fn(),
}));

jest.mock("../services/qdrantService", () => ({
  upsertChunk: jest.fn(),
}));

const {
  getChunksByDocumentId,
} = require("../repositories/chunkRepository");

const {
  generateEmbedding,
} = require("../services/embeddingService");

const {
  upsertChunk,
} = require("../services/qdrantService");

const {
  ingestDocumentChunks,
} = require("../services/ingestionService");

describe("Document Ingestion Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should ingest all document chunks successfully", async () => {
    const chunks = [
      {
        id: "chunk-1",
        document_id: "document-1",
        chunk_index: 0,
        content: "First chunk",
      },
      {
        id: "chunk-2",
        document_id: "document-1",
        chunk_index: 1,
        content: "Second chunk",
      },
    ];

    getChunksByDocumentId.mockResolvedValue(chunks);

    generateEmbedding
      .mockResolvedValueOnce([0.1, 0.2, 0.3])
      .mockResolvedValueOnce([0.4, 0.5, 0.6]);

    upsertChunk.mockResolvedValue(undefined);

    const result = await ingestDocumentChunks(
      "document-1",
      "project-1"
    );

    expect(result).toEqual({
      documentId: "document-1",
      chunksProcessed: 2,
    });

    expect(
      getChunksByDocumentId
    ).toHaveBeenCalledWith("document-1");

    expect(generateEmbedding).toHaveBeenCalledTimes(2);

    expect(generateEmbedding).toHaveBeenNthCalledWith(
      1,
      "First chunk"
    );

    expect(generateEmbedding).toHaveBeenNthCalledWith(
      2,
      "Second chunk"
    );

    expect(upsertChunk).toHaveBeenCalledTimes(2);

    expect(upsertChunk).toHaveBeenNthCalledWith(1, {
      id: "chunk-1",
      vector: [0.1, 0.2, 0.3],
      documentId: "document-1",
      projectId: "project-1",
      chunkIndex: 0,
      content: "First chunk",
    });

    expect(upsertChunk).toHaveBeenNthCalledWith(2, {
      id: "chunk-2",
      vector: [0.4, 0.5, 0.6],
      documentId: "document-1",
      projectId: "project-1",
      chunkIndex: 1,
      content: "Second chunk",
    });
  });

  test("should reject when document has no chunks", async () => {
    getChunksByDocumentId.mockResolvedValue([]);

    await expect(
      ingestDocumentChunks(
        "document-1",
        "project-1"
      )
    ).rejects.toThrow(
      "No chunks found for this document."
    );

    expect(generateEmbedding).not.toHaveBeenCalled();
    expect(upsertChunk).not.toHaveBeenCalled();
  });

  test("should propagate embedding generation errors", async () => {
    const chunks = [
      {
        id: "chunk-1",
        document_id: "document-1",
        chunk_index: 0,
        content: "First chunk",
      },
    ];

    getChunksByDocumentId.mockResolvedValue(chunks);

    generateEmbedding.mockRejectedValue(
      new Error("Embedding generation failed")
    );

    await expect(
      ingestDocumentChunks(
        "document-1",
        "project-1"
      )
    ).rejects.toThrow(
      "Embedding generation failed"
    );

    expect(upsertChunk).not.toHaveBeenCalled();
  });

  test("should propagate Qdrant upsert errors", async () => {
    const chunks = [
      {
        id: "chunk-1",
        document_id: "document-1",
        chunk_index: 0,
        content: "First chunk",
      },
    ];

    getChunksByDocumentId.mockResolvedValue(chunks);

    generateEmbedding.mockResolvedValue([
      0.1,
      0.2,
      0.3,
    ]);

    upsertChunk.mockRejectedValue(
      new Error("Qdrant upsert failed")
    );

    await expect(
      ingestDocumentChunks(
        "document-1",
        "project-1"
      )
    ).rejects.toThrow(
      "Qdrant upsert failed"
    );
  });

  test("should process chunks sequentially", async () => {
    const chunks = [
      {
        id: "chunk-1",
        document_id: "document-1",
        chunk_index: 0,
        content: "First chunk",
      },
      {
        id: "chunk-2",
        document_id: "document-1",
        chunk_index: 1,
        content: "Second chunk",
      },
    ];

    getChunksByDocumentId.mockResolvedValue(chunks);

    generateEmbedding
      .mockResolvedValueOnce([1, 2, 3])
      .mockResolvedValueOnce([4, 5, 6]);

    upsertChunk.mockResolvedValue(undefined);

    await ingestDocumentChunks(
      "document-1",
      "project-1"
    );

    expect(generateEmbedding).toHaveBeenCalledTimes(2);
    expect(upsertChunk).toHaveBeenCalledTimes(2);

    expect(
      generateEmbedding.mock.invocationCallOrder[0]
    ).toBeLessThan(
      generateEmbedding.mock.invocationCallOrder[1]
    );

    expect(
      upsertChunk.mock.invocationCallOrder[0]
    ).toBeLessThan(
      upsertChunk.mock.invocationCallOrder[1]
    );
  });
});