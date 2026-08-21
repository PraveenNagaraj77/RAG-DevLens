const {
  getChunksByDocumentId,
} = require("../repositories/chunkRepository");

const {
  upsertChunks,
} = require("./qdrantService");

const {
  generateEmbeddings,
  EMBEDDING_DIMENSION,
} = require("./embeddingService");

const EMBEDDING_BATCH_SIZE = 20;

// ==================================================
// INGEST DOCUMENT CHUNKS
// ==================================================

const ingestDocumentChunks = async (
  documentId,
  projectId,
) => {
  const chunks =
    await getChunksByDocumentId(documentId);

  if (chunks.length === 0) {
    throw new Error(
      "No chunks found for this document.",
    );
  }

  let processed = 0;

  const total = chunks.length;

  for (
    let start = 0;
    start < chunks.length;
    start += EMBEDDING_BATCH_SIZE
  ) {
    const batch = chunks.slice(
      start,
      start + EMBEDDING_BATCH_SIZE,
    );

    const batchNumber =
      Math.floor(
        start / EMBEDDING_BATCH_SIZE,
      ) + 1;

    console.log(
      `Embedding batch ${batchNumber} | ${processed}/${total}`,
    );

    // ------------------------------------------------
    // Generate embeddings
    // ------------------------------------------------

    const embeddings =
      await generateEmbeddings(
        batch.map(
          (chunk) => chunk.content,
        ),
      );

    // ------------------------------------------------
    // Validate embeddings
    // ------------------------------------------------

    if (
      !Array.isArray(embeddings) ||
      embeddings.length !== batch.length
    ) {
      throw new Error(
        `Invalid embedding response. Expected ${batch.length} embeddings, got ${
          embeddings?.length || 0
        }.`,
      );
    }

    for (
      let i = 0;
      i < embeddings.length;
      i++
    ) {
      if (
        !Array.isArray(embeddings[i])
      ) {
        throw new Error(
          `Invalid embedding at index ${i}.`,
        );
      }

      if (
        embeddings[i].length !==
        EMBEDDING_DIMENSION
      ) {
        throw new Error(
          `Invalid embedding dimension at index ${i}. Expected ${EMBEDDING_DIMENSION}, got ${embeddings[i].length}.`,
        );
      }
    }

    // ------------------------------------------------
    // Prepare Qdrant points
    // ------------------------------------------------

    const points = batch.map(
      (chunk, index) => ({
        id: chunk.id,

        vector: embeddings[index],

        payload: {
          documentId:
            chunk.document_id,

          projectId,

          chunkIndex:
            chunk.chunk_index,

          content:
            chunk.content,
        },
      }),
    );

    // ------------------------------------------------
    // DEBUG
    // ------------------------------------------------

    console.log(
      "Qdrant first point:",
      {
        id: points[0]?.id,
        hasVector:
          Array.isArray(
            points[0]?.vector,
          ),
        vectorLength:
          points[0]?.vector?.length,
        payload:
          points[0]?.payload,
      },
    );

    // ------------------------------------------------
    // Insert into Qdrant
    // ------------------------------------------------

    await upsertChunks(points);

    processed += batch.length;

    console.log(
      `Embedding batch ${batchNumber} completed | ${processed}/${total}`,
    );
  }

  return {
    documentId,
    chunksProcessed: processed,
  };
};

module.exports = {
  ingestDocumentChunks,
};