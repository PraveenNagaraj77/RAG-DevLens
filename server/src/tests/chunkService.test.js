const pool = require("../config/db");

const {
  createChunks,
  saveDocumentChunks,
} = require("../services/chunkService");

jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

describe("Chunk Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createChunks", () => {
    test("should create a single chunk for short text", () => {
      const text = "This is a short document.";

      const chunks = createChunks(text);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    test("should create multiple chunks for long text", () => {
      const text = "a".repeat(2500);

      const chunks = createChunks(text);

      expect(chunks).toHaveLength(4);

      expect(chunks[0]).toHaveLength(1000);
      expect(chunks[1]).toHaveLength(1000);
      expect(chunks[2]).toHaveLength(900);
      expect(chunks[3]).toHaveLength(100);
    });

    test("should maintain 200 character overlap between chunks", () => {
      const text = "a".repeat(2200);

      const chunks = createChunks(text);

      expect(chunks).toHaveLength(3);

      expect(chunks[0].slice(-200)).toBe(chunks[1].slice(0, 200));

      expect(chunks[1].slice(-200)).toBe(chunks[2].slice(0, 200));
    });

    test("should trim whitespace from chunks", () => {
      const text = "   This is a document with whitespace.   ";

      const chunks = createChunks(text);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe("This is a document with whitespace.");
    });

    test("should ignore empty chunks", () => {
      const text = "     ";

      const chunks = createChunks(text);

      expect(chunks).toHaveLength(0);
    });

    test("should return an empty array for empty text", () => {
      const chunks = createChunks("");

      expect(chunks).toEqual([]);
    });
  });

  describe("saveDocumentChunks", () => {
    test("should save all chunks to PostgreSQL", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const documentId = "11111111-1111-1111-1111-111111111111";

      const content = "a".repeat(2200);

      const result = await saveDocumentChunks(documentId, content);

      expect(result).toHaveLength(3);

      expect(pool.query).toHaveBeenCalledTimes(3);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO document_chunks"),
        [documentId, 0, expect.any(String)],
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO document_chunks"),
        [documentId, 1, expect.any(String)],
      );

      expect(pool.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("INSERT INTO document_chunks"),
        [documentId, 2, expect.any(String)],
      );
    });

    test("should return created chunks", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const documentId = "22222222-2222-2222-2222-222222222222";

      const content = "This is a test document for chunking.";

      const result = await saveDocumentChunks(documentId, content);

      expect(result).toEqual(["This is a test document for chunking."]);
    });

    test("should not insert anything for empty content", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const documentId = "33333333-3333-3333-3333-333333333333";

      const result = await saveDocumentChunks(documentId, "");

      expect(result).toEqual([]);
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("should propagate database errors", async () => {
      pool.query.mockRejectedValueOnce(new Error("Database insert failed"));

      const documentId = "44444444-4444-4444-4444-444444444444";

      const content = "Test document";

      await expect(saveDocumentChunks(documentId, content)).rejects.toThrow(
        "Database insert failed",
      );

      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("should save chunks with correct chunk indexes", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const documentId = "55555555-5555-5555-5555-555555555555";

      const content = "a".repeat(2200);

      await saveDocumentChunks(documentId, content);

      const calls = pool.query.mock.calls;

      expect(calls[0][1][1]).toBe(0);
      expect(calls[1][1][1]).toBe(1);
      expect(calls[2][1][1]).toBe(2);
    });
  });
});
