const path = require("path");

const pool = require("../config/db");
const {
  saveDocumentChunks,
} = require("../services/chunkService");
const {
  extractText,
} = require("../services/documentTextService");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const uploadDocument = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;

  // Check file
  if (!req.file) {
    throw new AppError("File is required", 400);
  }

  // Check project ownership
  const projectResult = await pool.query(
    `
    SELECT id
    FROM projects
    WHERE id = $1 AND user_id = $2
    `,
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  const file = req.file;

  // Extract text from document
  const content = await extractText(file);

  const fileExtension = path
    .extname(file.originalname)
    .toLowerCase();

  // Store document
  const result = await pool.query(
    `
    INSERT INTO documents
    (
      project_id,
      file_name,
      file_type,
      content
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      projectId,
      file.originalname,
      fileExtension,
      content,
    ]
  );

  const document = result.rows[0];

  // Create chunks + embeddings + store in Qdrant
  await saveDocumentChunks(
    document.id,
    document.content
  );

  return res.status(201).json({
    success: true,
    message:
      "Document uploaded successfully and processed successfully",
    data: {
      id: document.id,
      project_id: document.project_id,
      file_name: document.file_name,
      file_type: document.file_type,
    },
  });
});


const getProjectDocuments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;

  // Check project ownership
  const projectResult = await pool.query(
    `
    SELECT id
    FROM projects
    WHERE id = $1 AND user_id = $2
    `,
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  const result = await pool.query(
    `
    SELECT
      id,
      project_id,
      file_name,
      file_type,
      created_at
    FROM documents
    WHERE project_id = $1
    ORDER BY created_at DESC
    `,
    [projectId]
  );

  return res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});


const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.userId;

  // Find document and verify project ownership
  const documentResult = await pool.query(
    `
    SELECT
      d.id,
      d.project_id,
      d.file_name
    FROM documents d
    INNER JOIN projects p
      ON p.id = d.project_id
    WHERE d.id = $1
      AND p.user_id = $2
    `,
    [documentId, userId]
  );

  if (documentResult.rows.length === 0) {
    throw new AppError("Document not found", 404);
  }

  const document = documentResult.rows[0];

  // Delete document chunks from PostgreSQL
  await pool.query(
    `
    DELETE FROM document_chunks
    WHERE document_id = $1
    `,
    [documentId]
  );

  // Delete document
  await pool.query(
    `
    DELETE FROM documents
    WHERE id = $1
    `,
    [documentId]
  );

  return res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    data: {
      id: document.id,
      project_id: document.project_id,
      file_name: document.file_name,
    },
  });
});

module.exports = {
  uploadDocument,
  getProjectDocuments,
  deleteDocument,
};