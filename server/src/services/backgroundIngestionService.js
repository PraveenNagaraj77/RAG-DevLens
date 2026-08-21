const pool = require("../config/db");

const {
  saveDocumentChunks,
} = require("../repositories/chunkRepository");

const {
  ingestDocumentChunks,
} = require("./ingestionService");

// ==================================================
// PROCESS DOCUMENT
// ==================================================

const processDocument = async (
  document,
) => {
  const {
    id: documentId,
    project_id: projectId,
  } = document;

  try {
    console.log(
      `Starting ingestion for document ${documentId}`,
    );

    // ------------------------------------------------
    // Get document
    // ------------------------------------------------

    const result = await pool.query(
      `
        SELECT
          id,
          project_id,
          content
        FROM documents
        WHERE id = $1
      `,
      [documentId],
    );

    if (result.rows.length === 0) {
      throw new Error(
        "Document not found.",
      );
    }

    const dbDocument =
      result.rows[0];

    // ------------------------------------------------
    // Save chunks
    // ------------------------------------------------

    await saveDocumentChunks(
      documentId,
      dbDocument.content,
    );

    console.log(
      `Chunks created for document ${documentId}`,
    );

    // ------------------------------------------------
    // Generate embeddings + Qdrant
    // ------------------------------------------------

    const ingestionResult =
      await ingestDocumentChunks(
        documentId,
        projectId,
      );

    // ------------------------------------------------
    // Mark completed
    // ------------------------------------------------

    await pool.query(
      `
        UPDATE documents
        SET
          ingestion_status = 'completed',
          ingestion_error = NULL
        WHERE id = $1
      `,
      [documentId],
    );

    console.log(
      `Document ${documentId} ingestion completed`,
    );

    return ingestionResult;
  } catch (error) {
    console.error(
      `Document ${documentId} ingestion failed:`,
      error,
    );

    // ------------------------------------------------
    // Mark failed
    // ------------------------------------------------

    await pool.query(
      `
        UPDATE documents
        SET
          ingestion_status = 'failed',
          ingestion_error = $2
        WHERE id = $1
      `,
      [
        documentId,
        error.message ||
          "Document ingestion failed",
      ],
    );

    return null;
  }
};

// ==================================================
// BACKGROUND PROCESSING
// ==================================================

const processDocumentsInBackground = (
  documents,
) => {
  setImmediate(async () => {
    for (const document of documents) {
      await processDocument(document);
    }
  });
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  processDocumentsInBackground,
  processDocument,
};