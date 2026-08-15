const gemini = require("../config/gemini");

const EMBEDDING_MODEL = "gemini-embedding-2";

const generateEmbedding = async (text) => {
  try {
    const response = await gemini.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        outputDimensionality: 768,
      },
    });

    return response.embeddings[0].values;
  } catch (error) {
    console.error("Embedding Generation Failed:", error.message);
    throw error;
  }
};

module.exports = {
  EMBEDDING_MODEL,
  generateEmbedding,
};