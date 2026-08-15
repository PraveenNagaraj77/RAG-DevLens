const pool = require("../config/db");

const getChunksByDocumentId = async (documentId) => {
  const result = await pool.query(
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
    [documentId]
  );

  return result.rows;
};

module.exports = {
  getChunksByDocumentId,
};