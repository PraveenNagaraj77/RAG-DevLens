const gemini = require("../config/gemini");

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMENSION = 768;

// ==================================================
// SINGLE EMBEDDING
// ==================================================

const generateEmbedding = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error(
      "Text is required for embedding generation.",
    );
  }

  try {
    const response =
      await gemini.models.embedContent({
        model: EMBEDDING_MODEL,

        contents: text,

        config: {
          outputDimensionality:
            EMBEDDING_DIMENSION,

          taskType:
            "RETRIEVAL_DOCUMENT",
        },
      });

    const embedding =
      response?.embeddings?.[0]?.values;

    if (!Array.isArray(embedding)) {
      throw new Error(
        "Gemini returned an invalid embedding.",
      );
    }

    if (
      embedding.length !==
      EMBEDDING_DIMENSION
    ) {
      throw new Error(
        `Invalid embedding dimension. Expected ${EMBEDDING_DIMENSION}, got ${embedding.length}.`,
      );
    }

    return embedding;
  } catch (error) {
    console.error(
      "Embedding generation failed:",
      error,
    );

    throw error;
  }
};

// ==================================================
// MULTIPLE EMBEDDINGS
// ==================================================

const generateEmbeddings = async (texts) => {
  if (
    !Array.isArray(texts) ||
    texts.length === 0
  ) {
    return [];
  }

  const embeddings = [];

  for (let i = 0; i < texts.length; i++) {
    console.log(
      `Generating embedding ${i + 1}/${texts.length}`,
    );

    const embedding =
      await generateEmbedding(
        texts[i],
      );

    embeddings.push(embedding);
  }

  return embeddings;
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
  generateEmbedding,
  generateEmbeddings,
};