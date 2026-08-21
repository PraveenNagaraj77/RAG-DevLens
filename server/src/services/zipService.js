const unzipper = require("unzipper");
const path = require("path");

const SUPPORTED_EXTENSIONS = new Set([
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
]);

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
]);

const shouldIgnorePath = (filePath) => {
  const normalizedPath = filePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  const parts = normalizedPath.split("/");

  return parts.some((part) =>
    IGNORED_DIRECTORIES.has(part)
  );
};

const isSupportedFile = (filePath) => {
  const extension = path
    .extname(filePath)
    .toLowerCase();

  return SUPPORTED_EXTENSIONS.has(extension);
};

const extractZipFiles = async (buffer) => {
  const directory = await unzipper.Open.buffer(buffer);

  const files = [];

  for (const entry of directory.files) {
    const filePath = entry.path;

    // Ignore directories
    if (entry.type === "Directory") {
      continue;
    }

    // Ignore unwanted directories
    if (shouldIgnorePath(filePath)) {
      continue;
    }

    // Only process supported files
    if (!isSupportedFile(filePath)) {
      continue;
    }

    const fileBuffer = await entry.buffer();

    if (!fileBuffer.length) {
      continue;
    }

    files.push({
      buffer: fileBuffer,
      originalname: filePath,
      mimetype: "text/plain",
    });
  }

  return files;
};

module.exports = {
  extractZipFiles,
  isSupportedFile,
  shouldIgnorePath,
};