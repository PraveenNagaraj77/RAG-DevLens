jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

const pool = require("../config/db");
const {
  getChunksByDocumentId,
} = require("../repositories/chunkRepository");

describe("Chunk Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getChunksByDocumentId", () => {
    test("should return chunks for a document", async () => {
      const mockChunks = [
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

      pool.query.mockResolvedValue({
        rows: mockChunks,
      });

      const result = await getChunksByDocumentId("document-1");

      expect(result).toEqual(mockChunks);

      expect(pool.query).toHaveBeenCalledTimes(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "WHERE document_id = $1"
        ),
        ["document-1"]
      );
    });

    test("should return chunks ordered by chunk index", async () => {
      pool.query.mockResolvedValue({
        rows: [
          {
            id: "chunk-1",
            document_id: "document-1",
            chunk_index: 0,
            content: "First",
          },
          {
            id: "chunk-2",
            document_id: "document-1",
            chunk_index: 1,
            content: "Second",
          },
        ],
      });

      const result = await getChunksByDocumentId(
        "document-1"
      );

      expect(result[0].chunk_index).toBe(0);
      expect(result[1].chunk_index).toBe(1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining(
          "ORDER BY chunk_index ASC"
        ),
        ["document-1"]
      );
    });

    test("should return empty array when document has no chunks", async () => {
      pool.query.mockResolvedValue({
        rows: [],
      });

      const result = await getChunksByDocumentId(
        "document-without-chunks"
      );

      expect(result).toEqual([]);
    });

    test("should propagate database errors", async () => {
      const error = new Error("Database error");

      pool.query.mockRejectedValue(error);

      await expect(
        getChunksByDocumentId("document-1")
      ).rejects.toThrow("Database error");
    });
  });
});