const multer = require("multer");

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".pdf",
  ".java",
  ".sql",
  ".zip",
]);

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 50,
  },

  fileFilter: (req, file, cb) => {
    const originalName = file.originalname || "";

    const extension = originalName
      .substring(originalName.lastIndexOf("."))
      .toLowerCase();

    if (!extension || extension === originalName.toLowerCase()) {
      return cb(new Error("File must have a valid extension"));
    }

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return cb(
        new Error(`Unsupported file type: ${extension}`)
      );
    }

    cb(null, true);
  },
});
module.exports = upload;