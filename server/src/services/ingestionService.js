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
  console.log(
    `Generating embedding for chunk ${chunk.chunk_index + 1}/${chunks.length}`
  );

  const vector = await generateEmbedding(chunk.content);

  console.log(
    `Embedding generated for chunk ${chunk.chunk_index}: ${vector.length} dimensions`
  );

  await upsertChunk({
    id: chunk.id,
    vector,
    documentId: chunk.document_id,
    projectId,
    chunkIndex: chunk.chunk_index,
    content: chunk.content,
  });

  console.log(
    `Chunk ${chunk.chunk_index} successfully inserted into Qdrant`
  );
}

  return {
    documentId,
    chunksProcessed: chunks.length,
  };
};

module.exports = {
  ingestDocumentChunks,
};