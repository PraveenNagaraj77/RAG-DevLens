const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getProjectDocuments,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

router.use(authMiddleware);

// Get all documents for a project
router.get(
  "/projects/:projectId",
  getProjectDocuments
);

// Upload document
router.post(
  "/projects/:projectId/upload",
  upload.single("file"),
  uploadDocument
);

// Delete document
router.delete(
  "/:documentId",
  deleteDocument
);

module.exports = router;