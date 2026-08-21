const pool = require("../config/db");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// ==================================================
// CREATE CHUNKS
// ==================================================

const createChunks = (text) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      text.length,
    );

    const chunk = text
      .slice(start, end)
      .trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start +=
      CHUNK_SIZE -
      CHUNK_OVERLAP;
  }

  return chunks;
};

// ==================================================
// SAVE DOCUMENT CHUNKS
// ==================================================

const saveDocumentChunks = async (
  documentId,
  content,
) => {
  const chunks =
    createChunks(content);

  if (chunks.length === 0) {
    throw new Error(
      "No chunks could be created from document content.",
    );
  }

  // Remove old chunks when retrying
  await pool.query(
    `
      DELETE FROM document_chunks
      WHERE document_id = $1
    `,
    [documentId],
  );

  const values = [];
  const placeholders = [];

  chunks.forEach(
    (chunk, index) => {
      const baseIndex =
        index * 3;

      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`,
      );

      values.push(
        documentId,
        index,
        chunk,
      );
    },
  );

  await pool.query(
    `
      INSERT INTO document_chunks
      (
        document_id,
        chunk_index,
        content
      )
      VALUES ${placeholders.join(", ")}
    `,
    values,
  );

  return chunks;
};

// ==================================================
// GET CHUNKS
// ==================================================

const getChunksByDocumentId =
  async (documentId) => {
    const result =
      await pool.query(
        `
          SELECT
            id,
            document_id,
            chunk_index,
            content
          FROM document_chunks
          WHERE document_id = $1
          ORDER BY chunk_index ASC
        `,
        [documentId],
      );

    return result.rows;
  };

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  createChunks,
  saveDocumentChunks,
  getChunksByDocumentId,
};