const qdrantClient = require("../config/qdrant");

const COLLECTION_NAME = "devlens_chunks";

const VECTOR_SIZE = 768;

const createCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();

    const exists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    if (exists) {
      console.log(`Qdrant collection '${COLLECTION_NAME}' already exists.`);
      return;
    }

    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });

    console.log(`Qdrant collection '${COLLECTION_NAME}' created successfully.`);
  } catch (error) {
    console.error("Qdrant collection creation failed:", error.message);
    throw error;
  }
};

const testQdrantConnection = async () => {
  try {
    const result = await qdrantClient.getCollections();

    console.log("Qdrant Connected Successfully");
    console.log("Collections:", result.collections);

    return true;
  } catch (error) {
    console.log("Qdrant Connection Failed:", error.message);
    return false;
  }
};

const upsertChunk = async ({
  id,
  vector,
  documentId,
  projectId,
  chunkIndex,
  content,
}) => {
  try {
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,

      points: [
        {
          id,
          vector,

          payload: {
            documentId,
            projectId,
            chunkIndex,
            content,
          },
        },
      ],
    });

    console.log(`Chunk ${id} stored in Qdrant.`);
  } catch (error) {
    console.error("Qdrant chunk upsert failed:", error.message);
    throw error;
  }
};

const upsertChunks = async (points) => {
  if (!points || points.length === 0) {
    return;
  }

  try {
    await qdrantClient.upsert(
      COLLECTION_NAME,
      {
        wait: true,

        points,
      },
    );
  } catch (error) {
    console.error(
      "Qdrant batch upsert failed:",
      error.message,
    );

    throw error;
  }
};

const searchSimilarChunks = async (
  vector,
  projectId,
  limit = 5
) => {
  try {
    console.log("Qdrant search projectId:", projectId);
    console.log("Qdrant query vector length:", vector.length);

    const result = await qdrantClient.query(
      COLLECTION_NAME,
      {
        query: vector,
        limit,
        with_payload: true,
        with_vector: false,

        filter: {
          must: [
            {
              key: "projectId",
              match: {
                value: projectId,
              },
            },
          ],
        },
      }
    );

    console.log(
      "Qdrant search results:",
      result.points.length
    );
    result.points.forEach((point, index) => {
  console.log(`Result ${index + 1}:`, {
    chunkIndex: point.payload.chunkIndex,
    score: point.score,
    preview: point.payload.content?.slice(0, 150),
  });
});

    if (result.points.length > 0) {
      console.log(
        "First result payload:",
        result.points[0].payload
      );
    }

    return result.points;
  } catch (error) {
    console.error(
      "Qdrant similarity search failed:",
      error.message
    );

    throw error;
  }
};

const createPayloadIndexes = async () => {
  try {
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "projectId",
      field_schema: "uuid",
      wait: true,
    });

    console.log("Qdrant payload index created for projectId.");

    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "documentId",
      field_schema: "uuid",
      wait: true,
    });

    console.log("Qdrant payload index created for documentId.");
  } catch (error) {
    console.error(
      "Qdrant payload index creation failed:",
      error.message
    );

    throw error;
  }
};

const deleteDocumentChunks = async (documentId) => {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
        ],
      },
    });

    console.log(
      `Qdrant chunks deleted for document ${documentId}`
    );
  } catch (error) {
    console.error(
      "Qdrant document chunks deletion failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  COLLECTION_NAME,
  VECTOR_SIZE,
  testQdrantConnection,
  createCollection,
  upsertChunk,
  upsertChunks,
  searchSimilarChunks,
  createPayloadIndexes,
  deleteDocumentChunks,
};