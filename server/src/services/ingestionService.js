const {
  getChunksByDocumentId,
} = require("../repositories/chunkRepository");

const {
  upsertChunk,
} = require("./qdrantService");

const {
  generateEmbedding,
} = require("./embeddingService");

const ingestDocumentChunks = async (documentId, projectId) => {
  const chunks = await getChunksByDocumentId(documentId);

  if (chunks.length === 0) {
    throw new Error("No chunks found for this document.");
  }

  for (const chunk of chunks) {
    const vector = await generateEmbedding(chunk.content);

    await upsertChunk({
      id: chunk.id,
      vector,
      documentId: chunk.document_id,
      projectId,
      chunkIndex: chunk.chunk_index,
      content: chunk.content,
    });
  }

  return {
    documentId,
    chunksProcessed: chunks.length,
  };
};

module.exports = {
  ingestDocumentChunks,
};