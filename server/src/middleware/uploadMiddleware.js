const multer = require("multer");

const storage = multer.memoryStorage();

const allowedFileTypes = {
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/plain"],
  ".js": ["text/javascript", "application/javascript", "text/plain"],
  ".jsx": ["text/javascript", "application/javascript", "text/plain"],
  ".ts": ["text/typescript", "application/typescript", "text/plain"],
  ".tsx": ["text/typescript", "application/typescript", "text/plain"],
  ".json": ["application/json", "text/plain"],
  ".html": ["text/html"],
  ".css": ["text/css"],
  ".pdf": ["application/pdf"],
};

const fileFilter = (req, file, cb) => {
  const originalName = file.originalname.toLowerCase();

  const lastDotIndex = originalName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return cb(
      new Error("File must have a valid extension")
    );
  }

  const extension = originalName.substring(lastDotIndex);

  const allowedMimeTypes = allowedFileTypes[extension];

  if (!allowedMimeTypes) {
    return cb(
      new Error("Unsupported file type")
    );
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file MIME type")
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },

  fileFilter,
});

module.exports = upload;