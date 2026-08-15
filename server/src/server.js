const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");
const { testQdrantConnection } = require("./services/qdrantService");

let server;

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully.");

    const qdrantConnected = await testQdrantConnection();

    if (!qdrantConnected) {
      throw new Error("Qdrant connection failed");
    }

    server = app.listen(env.port, () => {
      console.log(`DevLens server running on PORT ${env.port}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (!server) {
    await pool.end();
    process.exit(0);
  }

  server.close(async () => {
    console.log("HTTP server closed.");

    try {
      await pool.end();

      console.log("PostgreSQL connection pool closed.");
      console.log("DevLens shutdown complete.");

      process.exit(0);
    } catch (error) {
      console.error(
        "Error during graceful shutdown:",
        error.message
      );

      process.exit(1);
    }
  });
};

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

startServer();