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


const searchSimilarChunks = async (
  vector,
  projectId,
  limit = 5
) => {
  try {
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
  } catch (error) {
    console.error(
      "Qdrant payload index creation failed:",
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
  searchSimilarChunks,
  createPayloadIndexes,
};