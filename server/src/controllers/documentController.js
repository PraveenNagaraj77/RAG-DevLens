const path = require("path");

const pool = require("../config/db");

const { extractText } = require("../services/documentTextService");
const { extractZipFiles } = require("../services/zipService");
const { deleteDocumentChunks } = require("../services/qdrantService");

const {
  processDocumentsInBackground,
} = require("../services/backgroundIngestionService");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// ==================================================
// UPLOAD DOCUMENTS
// ==================================================

const uploadDocument = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;

  // --------------------------------------------------
  // Validate files
  // --------------------------------------------------

  if (!req.files || req.files.length === 0) {
    throw new AppError("At least one file is required", 400);
  }

  // --------------------------------------------------
  // Check project ownership
  // --------------------------------------------------

  const projectResult = await pool.query(
    `
      SELECT id
      FROM projects
      WHERE id = $1
        AND user_id = $2
    `,
    [projectId, userId],
  );

  if (projectResult.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  // --------------------------------------------------
  // Determine upload type
  // --------------------------------------------------

  const firstFile = req.files[0];

  const hasZip = req.files.some(
    (file) =>
      path.extname(file.originalname).toLowerCase() === ".zip",
  );

  const hasFolder = req.files.some(
    (file) => Boolean(file.webkitRelativePath),
  );

  let uploadType = "file";

  if (hasZip) {
    uploadType = "zip";
  } else if (hasFolder) {
    uploadType = "folder";
  }

  // --------------------------------------------------
  // Determine upload name
  // --------------------------------------------------

  let uploadName = "Uploaded files";

  if (uploadType === "zip") {
    uploadName = firstFile.originalname;
  } else if (uploadType === "folder") {
    const relativePath =
      firstFile.webkitRelativePath || "";

    const normalizedPath =
      relativePath.replace(/\\/g, "/");

    uploadName =
      normalizedPath.split("/")[0] ||
      firstFile.originalname;
  } else if (req.files.length === 1) {
    uploadName = firstFile.originalname;
  } else {
    uploadName = `${req.files.length} files`;
  }

  // --------------------------------------------------
  // Create upload group
  // --------------------------------------------------

  const uploadGroupResult = await pool.query(
    `
      INSERT INTO upload_groups
      (
        project_id,
        name,
        type
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        project_id,
        name,
        type,
        created_at
    `,
    [
      projectId,
      uploadName,
      uploadType,
    ],
  );

  const uploadGroup = uploadGroupResult.rows[0];

  // --------------------------------------------------
  // Normalize files
  // --------------------------------------------------

  const normalizedFiles = [];

  for (const file of req.files) {
    const extension =
      path.extname(file.originalname).toLowerCase();

    // ------------------------------------------------
    // ZIP
    // ------------------------------------------------

    if (extension === ".zip") {
      const extractedFiles =
        await extractZipFiles(file.buffer);

      normalizedFiles.push(...extractedFiles);

      continue;
    }

    // ------------------------------------------------
    // Normal file / folder file
    // ------------------------------------------------

    normalizedFiles.push({
      ...file,

      originalname:
        file.webkitRelativePath ||
        file.originalname,
    });
  }

  if (normalizedFiles.length === 0) {
    await pool.query(
      `
        DELETE FROM upload_groups
        WHERE id = $1
      `,
      [uploadGroup.id],
    );

    throw new AppError(
      "No supported files found",
      400,
    );
  }

  // --------------------------------------------------
  // Process files
  // --------------------------------------------------

  const processedDocuments = [];

  for (const file of normalizedFiles) {
    const fileExtension =
      path.extname(file.originalname).toLowerCase();

    // ------------------------------------------------
    // Extract text
    // ------------------------------------------------

    const content = await extractText(file);

    if (!content || !content.trim()) {
      continue;
    }

    // ------------------------------------------------
    // File name
    // ------------------------------------------------

    const fileName =
      path.basename(file.originalname);

    // ------------------------------------------------
    // File path
    // ------------------------------------------------

    const filePath =
      file.originalname;

    // ------------------------------------------------
    // Insert document
    //
    // IMPORTANT:
    // upload_id receives uploadGroup.id.
    // ------------------------------------------------

    const result = await pool.query(
      `
        INSERT INTO documents
        (
          project_id,
          upload_id,
          file_name,
          file_path,
          file_type,
          content,
          ingestion_status
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING
          id,
          project_id,
          upload_id,
          file_name,
          file_path,
          file_type,
          ingestion_status,
          ingestion_error,
          created_at
      `,
      [
        projectId,
        uploadGroup.id,
        fileName,
        filePath,
        fileExtension,
        content,
        "pending",
      ],
    );

    const document = result.rows[0];

    processedDocuments.push({
      id: document.id,
      project_id: document.project_id,

      upload_id: document.upload_id,

      upload_type: uploadType,
      upload_name: uploadName,

      file_name: document.file_name,
      file_path: document.file_path,
      file_type: document.file_type,

      ingestion_status:
        document.ingestion_status,

      ingestion_error:
        document.ingestion_error,

      created_at: document.created_at,
    });
  }

  // --------------------------------------------------
  // Nothing processed
  // --------------------------------------------------

  if (processedDocuments.length === 0) {
    await pool.query(
      `
        DELETE FROM upload_groups
        WHERE id = $1
      `,
      [uploadGroup.id],
    );

    throw new AppError(
      "No files could be processed",
      400,
    );
  }

  // --------------------------------------------------
  // Background ingestion
  // --------------------------------------------------

  processDocumentsInBackground(
    processedDocuments.map((document) => ({
      id: document.id,
      project_id: document.project_id,
    })),
  );

  // --------------------------------------------------
  // Response
  // --------------------------------------------------

  return res.status(201).json({
    success: true,

    message:
      "Files uploaded successfully",

    count:
      processedDocuments.length,

    upload_id:
      uploadGroup.id,

    upload_type:
      uploadType,

    upload_name:
      uploadName,

    data:
      processedDocuments,
  });
});

// ==================================================
// GET PROJECT DOCUMENTS
// ==================================================

const getProjectDocuments = asyncHandler(
  async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // ------------------------------------------------
    // Check project ownership
    // ------------------------------------------------

    const projectResult = await pool.query(
      `
        SELECT id
        FROM projects
        WHERE id = $1
          AND user_id = $2
      `,
      [projectId, userId],
    );

    if (projectResult.rows.length === 0) {
      throw new AppError(
        "Project not found",
        404,
      );
    }

    // ------------------------------------------------
    // Get documents
    // ------------------------------------------------

    const result = await pool.query(
      `
        SELECT
          d.id,
          d.project_id,
          d.upload_id,

          d.file_name,
          d.file_path,
          d.file_type,

          d.ingestion_status,
          d.ingestion_error,

          d.created_at,

          ug.name AS upload_name,
          ug.type AS upload_type

        FROM documents d

        LEFT JOIN upload_groups ug
          ON ug.id = d.upload_id

        WHERE d.project_id = $1

        ORDER BY d.created_at DESC
      `,
      [projectId],
    );

    return res.status(200).json({
      success: true,

      count:
        result.rows.length,

      data:
        result.rows,
    });
  },
);

// ==================================================
// DELETE SINGLE DOCUMENT
// ==================================================

const deleteDocument = asyncHandler(
  async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user.userId;

    // ------------------------------------------------
    // Find document
    // ------------------------------------------------

    const documentResult =
      await pool.query(
        `
          SELECT
            d.id,
            d.project_id,
            d.upload_id,
            d.file_name

          FROM documents d

          INNER JOIN projects p
            ON p.id = d.project_id

          WHERE d.id = $1
            AND p.user_id = $2
        `,
        [documentId, userId],
      );

    if (documentResult.rows.length === 0) {
      throw new AppError(
        "Document not found",
        404,
      );
    }

    const document =
      documentResult.rows[0];

    // ------------------------------------------------
    // Delete Qdrant vectors
    // ------------------------------------------------

    await deleteDocumentChunks(
      documentId,
    );

    // ------------------------------------------------
    // Delete PostgreSQL chunks
    // ------------------------------------------------

    await pool.query(
      `
        DELETE FROM document_chunks
        WHERE document_id = $1
      `,
      [documentId],
    );

    // ------------------------------------------------
    // Delete document
    // ------------------------------------------------

    await pool.query(
      `
        DELETE FROM documents
        WHERE id = $1
      `,
      [documentId],
    );

    // ------------------------------------------------
    // Delete upload group if empty
    // ------------------------------------------------

    if (document.upload_id) {
      const remainingResult =
        await pool.query(
          `
            SELECT COUNT(*)::int AS count
            FROM documents
            WHERE upload_id = $1
          `,
          [document.upload_id],
        );

      if (
        remainingResult.rows[0].count === 0
      ) {
        await pool.query(
          `
            DELETE FROM upload_groups
            WHERE id = $1
          `,
          [document.upload_id],
        );
      }
    }

    return res.status(200).json({
      success: true,

      message:
        "Document deleted successfully",

      data: {
        id:
          document.id,

        project_id:
          document.project_id,

        file_name:
          document.file_name,
      },
    });
  },
);

// ==================================================
// DELETE ENTIRE UPLOAD
// ==================================================

// ==================================================
// DELETE ENTIRE UPLOAD
// ==================================================

const deleteUpload = asyncHandler(
  async (req, res) => {
    const { uploadId } = req.params;
    const userId = req.user.userId;

    // ------------------------------------------------
    // Find upload group + verify ownership
    // ------------------------------------------------

    const uploadResult = await pool.query(
      `
        SELECT
          ug.id,
          ug.project_id,
          ug.name,
          ug.type
        FROM upload_groups ug
        INNER JOIN projects p
          ON p.id = ug.project_id
        WHERE ug.id = $1
          AND p.user_id = $2
      `,
      [uploadId, userId],
    );

    if (uploadResult.rows.length === 0) {
      throw new AppError(
        "Upload not found",
        404,
      );
    }

    const upload = uploadResult.rows[0];

    // ------------------------------------------------
    // Get all documents in this upload
    // ------------------------------------------------

    const documentResult = await pool.query(
      `
        SELECT
          id,
          file_name
        FROM documents
        WHERE upload_group_id = $1
           OR upload_id = $1
      `,
      [uploadId],
    );

    const documents = documentResult.rows;

    // ------------------------------------------------
    // Delete Qdrant vectors
    // ------------------------------------------------

    for (const document of documents) {
      try {
        await deleteDocumentChunks(document.id);
      } catch (error) {
        console.error(
          `Failed to delete Qdrant chunks for ${document.id}:`,
          error,
        );
      }
    }

    // ------------------------------------------------
    // Delete PostgreSQL chunks
    // ------------------------------------------------

    await pool.query(
      `
        DELETE FROM document_chunks
        WHERE document_id IN (
          SELECT id
          FROM documents
          WHERE upload_group_id = $1
             OR upload_id = $1
        )
      `,
      [uploadId],
    );

    // ------------------------------------------------
    // Delete documents
    // ------------------------------------------------

    await pool.query(
      `
        DELETE FROM documents
        WHERE upload_group_id = $1
           OR upload_id = $1
      `,
      [uploadId],
    );

    // ------------------------------------------------
    // Delete upload group
    // ------------------------------------------------

    await pool.query(
      `
        DELETE FROM upload_groups
        WHERE id = $1
      `,
      [uploadId],
    );

    // ------------------------------------------------
    // Response
    // ------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Upload deleted successfully",

      upload_id: upload.id,

      upload_name: upload.name,

      upload_type: upload.type,

      deleted_count: documents.length,
    });
  },
);

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  uploadDocument,
  getProjectDocuments,
  deleteDocument,
  deleteUpload,
};