const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");
const { testQdrantConnection } = require("./services/qdrantService");

let server;

const startServer = async () => {
  try {
    // Check PostgreSQL
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully.");

    // Check Qdrant
    await testQdrantConnection();

    // Start HTTP server
    server = app.listen(env.port, () => {
      console.log(
        `DevLens server running on PORT ${env.port}`
      );
      console.log(
        `Environment: ${env.nodeEnv}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      try {
        await pool.end();

        console.log("Database connection closed.");
        console.log("Server shutdown complete.");

        process.exit(0);
      } catch (error) {
        console.error(
          "Error during shutdown:",
          error.message
        );

        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();