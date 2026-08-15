const qdrantClient = require("../config/qdrant");

const {
  COLLECTION_NAME,
  VECTOR_SIZE,
  testQdrantConnection,
  createCollection,
  upsertChunk,
  searchSimilarChunks,
} = require("../services/qdrantService");

jest.mock("../config/qdrant", () => ({
  getCollections: jest.fn(),
  createCollection: jest.fn(),
  upsert: jest.fn(),
  query: jest.fn(),
}));

describe("Qdrant Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("testQdrantConnection", () => {
    test("should return true when Qdrant connection succeeds", async () => {
      qdrantClient.getCollections.mockResolvedValueOnce({
        collections: [],
      });

      const result = await testQdrantConnection();

      expect(result).toBe(true);

      expect(
        qdrantClient.getCollections
      ).toHaveBeenCalledTimes(1);
    });

    test("should return false when Qdrant connection fails", async () => {
      qdrantClient.getCollections.mockRejectedValueOnce(
        new Error("Qdrant connection failed")
      );

      const result = await testQdrantConnection();

      expect(result).toBe(false);

      expect(
        qdrantClient.getCollections
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("createCollection", () => {
    test("should create collection when it does not exist", async () => {
      qdrantClient.getCollections.mockResolvedValueOnce({
        collections: [],
      });

      qdrantClient.createCollection.mockResolvedValueOnce({});

      await createCollection();

      expect(
        qdrantClient.getCollections
      ).toHaveBeenCalledTimes(1);

      expect(
        qdrantClient.createCollection
      ).toHaveBeenCalledTimes(1);

      expect(
        qdrantClient.createCollection
      ).toHaveBeenCalledWith(
        COLLECTION_NAME,
        {
          vectors: {
            size: VECTOR_SIZE,
            distance: "Cosine",
          },
        }
      );
    });

    test("should not create collection when it already exists", async () => {
      qdrantClient.getCollections.mockResolvedValueOnce({
        collections: [
          {
            name: COLLECTION_NAME,
          },
        ],
      });

      await createCollection();

      expect(
        qdrantClient.getCollections
      ).toHaveBeenCalledTimes(1);

      expect(
        qdrantClient.createCollection
      ).not.toHaveBeenCalled();
    });

    test("should propagate collection creation errors", async () => {
      qdrantClient.getCollections.mockRejectedValueOnce(
        new Error("Qdrant unavailable")
      );

      await expect(
        createCollection()
      ).rejects.toThrow("Qdrant unavailable");

      expect(
        qdrantClient.createCollection
      ).not.toHaveBeenCalled();
    });

    test("should propagate createCollection API errors", async () => {
      qdrantClient.getCollections.mockResolvedValueOnce({
        collections: [],
      });

      qdrantClient.createCollection.mockRejectedValueOnce(
        new Error("Collection creation failed")
      );

      await expect(
        createCollection()
      ).rejects.toThrow(
        "Collection creation failed"
      );
    });
  });

  describe("upsertChunk", () => {
    test("should upsert a document chunk successfully", async () => {
      qdrantClient.upsert.mockResolvedValueOnce({});

      const chunk = {
        id: "chunk-1",
        vector: [0.1, 0.2, 0.3],
        documentId: "document-1",
        projectId: "project-1",
        chunkIndex: 0,
        content: "React documentation",
      };

      await upsertChunk(chunk);

      expect(
        qdrantClient.upsert
      ).toHaveBeenCalledTimes(1);

      expect(
        qdrantClient.upsert
      ).toHaveBeenCalledWith(
        COLLECTION_NAME,
        {
          wait: true,
          points: [
            {
              id: "chunk-1",
              vector: [0.1, 0.2, 0.3],
              payload: {
                documentId: "document-1",
                projectId: "project-1",
                chunkIndex: 0,
                content: "React documentation",
              },
            },
          ],
        }
      );
    });

    test("should propagate upsert errors", async () => {
      qdrantClient.upsert.mockRejectedValueOnce(
        new Error("Qdrant upsert failed")
      );

      await expect(
        upsertChunk({
          id: "chunk-1",
          vector: [0.1, 0.2],
          documentId: "document-1",
          projectId: "project-1",
          chunkIndex: 0,
          content: "Test content",
        })
      ).rejects.toThrow(
        "Qdrant upsert failed"
      );
    });
  });

  describe("searchSimilarChunks", () => {
    test("should search similar chunks successfully", async () => {
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

      qdrantClient.query.mockResolvedValueOnce({
        points: results,
      });

      const result = await searchSimilarChunks(
        [0.1, 0.2, 0.3],
        "project-1"
      );

      expect(result).toEqual(results);

      expect(
        qdrantClient.query
      ).toHaveBeenCalledTimes(1);

      expect(
        qdrantClient.query
      ).toHaveBeenCalledWith(
        COLLECTION_NAME,
        {
          query: [0.1, 0.2, 0.3],
          limit: 5,
          with_payload: true,
          with_vector: false,
          filter: {
            must: [
              {
                key: "projectId",
                match: {
                  value: "project-1",
                },
              },
            ],
          },
        }
      );
    });

    test("should use custom search limit", async () => {
      qdrantClient.query.mockResolvedValueOnce({
        points: [],
      });

      await searchSimilarChunks(
        [0.1, 0.2],
        "project-1",
        10
      );

      expect(
        qdrantClient.query
      ).toHaveBeenCalledWith(
        COLLECTION_NAME,
        expect.objectContaining({
          limit: 10,
        })
      );
    });

    test("should return empty array when no chunks are found", async () => {
      qdrantClient.query.mockResolvedValueOnce({
        points: [],
      });

      const result = await searchSimilarChunks(
        [0.1, 0.2],
        "project-1"
      );

      expect(result).toEqual([]);
    });

    test("should enforce project-level filtering", async () => {
      qdrantClient.query.mockResolvedValueOnce({
        points: [],
      });

      await searchSimilarChunks(
        [0.1, 0.2],
        "project-123",
        5
      );

      const query =
        qdrantClient.query.mock.calls[0][1];

      expect(
        query.filter.must[0].key
      ).toBe("projectId");

      expect(
        query.filter.must[0].match.value
      ).toBe("project-123");
    });

    test("should disable vector return in search results", async () => {
      qdrantClient.query.mockResolvedValueOnce({
        points: [],
      });

      await searchSimilarChunks(
        [0.1, 0.2],
        "project-1"
      );

      expect(
        qdrantClient.query
      ).toHaveBeenCalledWith(
        COLLECTION_NAME,
        expect.objectContaining({
          with_vector: false,
          with_payload: true,
        })
      );
    });

    test("should propagate Qdrant search errors", async () => {
      qdrantClient.query.mockRejectedValueOnce(
        new Error("Qdrant search failed")
      );

      await expect(
        searchSimilarChunks(
          [0.1, 0.2],
          "project-1"
        )
      ).rejects.toThrow(
        "Qdrant search failed"
      );
    });
  });
});