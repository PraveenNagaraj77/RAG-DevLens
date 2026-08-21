const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getProjectDocuments,
  deleteDocument,
  deleteUpload,
} = require("../controllers/documentController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/projects/:projectId",
  getProjectDocuments
);

router.post(
  "/projects/:projectId/upload",
  upload.array("files", 50),
  uploadDocument
);

router.delete(
  "/upload/:uploadId",
  deleteUpload
);

router.delete(
  "/:documentId",
  deleteDocument
);



module.exports = router;