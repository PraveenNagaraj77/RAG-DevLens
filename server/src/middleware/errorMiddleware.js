const multer = require("multer");

const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR:", err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File too large. Maximum allowed size is 5 MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // File filter errors
  if (err.message === "Unsupported file type") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message === "Invalid file MIME type") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message === "File must have a valid extension") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Application errors
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

module.exports = errorMiddleware;