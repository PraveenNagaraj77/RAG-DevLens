const pool = require("../config/db");
const qdrantClient = require("../config/qdrant");

const healthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DevLens API is running",
  });
};

const readinessCheck = async (req, res) => {
  const checks = {
    database: false,
    qdrant: false,
  };

  try {
    // PostgreSQL check
    await pool.query("SELECT 1");
    checks.database = true;
  } catch (error) {
    console.error(
      "Health check - PostgreSQL:",
      error.message
    );
  }

  try {
    // Qdrant check
    await qdrantClient.getCollections();
    checks.qdrant = true;
  } catch (error) {
    console.error(
      "Health check - Qdrant:",
      error.message
    );
  }

  const ready =
    checks.database &&
    checks.qdrant;

  return res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? "ready" : "not_ready",
    checks,
  });
};

module.exports = {
  healthCheck,
  readinessCheck,
};