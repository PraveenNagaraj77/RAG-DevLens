const pool = require("../config/db");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

const createChunks = (text) => {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
};

const saveDocumentChunks = async (documentId,content)=>{
    const chunks = createChunks(content);

    for (let i = 0; i < chunks.length; i++) {
        await pool.query(
            `INSERT INTO document_chunks(document_id,chunk_index,content) VALUES ($1,$2,$3)`,[documentId,i,chunks[i]]
        )    
    }
    return chunks;
}

module.exports = { 
    createChunks,
    saveDocumentChunks,
}