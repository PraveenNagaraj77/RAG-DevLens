const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { uploadDocument } = require("../controllers/documentController");

const router = express.Router();


router.use(authMiddleware);

router.post("/projects/:projectId/upload",upload.single("file"),uploadDocument);

module.exports = router;

