const {
  retrieveRelevantChunks,
} = require("./retrievalService");

const {
  generateAnswer,
} = require("./llmService");

const generateRAGAnswer = async (question,projectId,history=[], limit = 5) => {
  try {
    console.log("Starting RAG pipeline...");

    // 1. Retrieve relevant chunks
    const results = await retrieveRelevantChunks(
      question,
      projectId,
      limit
    );

    if (results.length === 0) {
      return {
        answer:
          "I couldn't find relevant information in the provided project documentation.",
        sources: [],
      };
    }

    // 2. Build context
    const context = results
      .map((result, index) => {
        return `
Source ${index + 1}:
${result.payload.content}
`;
      })
      .join("\n");

    // 3. Generate answer
    const answer = await generateAnswer(
      question,
      context,
      history
    );

    // 4. Return answer + sources
    const sources = results.map((result) => ({
      documentId: result.payload.documentId,
      projectId: result.payload.projectId,
      chunkIndex: result.payload.chunkIndex,
      score: result.score,
    }));

    return {
      answer,
      sources,
    };
  } catch (error) {
    console.error("RAG pipeline failed:", error.message);
    throw error;
  }
};

module.exports = {
  generateRAGAnswer,
};