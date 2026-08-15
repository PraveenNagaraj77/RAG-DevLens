const { generateEmbedding } = require("./embeddingService");
const { searchSimilarChunks } = require("./qdrantService");

const retrieveRelevantChunks = async (
  query,
  projectId,
  limit = 5
) => {
  try {
    console.log(`Generating query embedding for: "${query}"`);

    const queryVector = await generateEmbedding(query);

    console.log(
      `Searching Qdrant for project: ${projectId}...`
    );

    const results = await searchSimilarChunks(
      queryVector,
      projectId,
      limit
    );

    return results;
  } catch (error) {
    console.error("Retrieval failed:", error.message);
    throw error;
  }
};

module.exports = {
  retrieveRelevantChunks,
};