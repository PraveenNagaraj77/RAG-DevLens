require("dotenv").config();


const requiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
};

const env = {
  port: Number(process.env.PORT) || 5000,

  nodeEnv: process.env.NODE_ENV || "development",

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || "devlens",
    user: process.env.DB_USER || "postgres",
    password: requiredEnv("DB_PASSWORD"),
  },

  jwt: {
    secret: requiredEnv("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  qdrant: {
    url:
      process.env.QDRANT_URL ||
      "http://localhost:6333",

    apiKey: process.env.QDRANT_API_KEY || null,
  },

  gemini: {
    apiKey: requiredEnv("GEMINI_API_KEY"),

    generationModel:
      process.env.GEMINI_GENERATION_MODEL ||
      "gemini-3.5-flash-lite",
  },

  conversation: {
    historyLimit:
      Number(
        process.env.CONVERSATION_HISTORY_LIMIT || 10
      ),
  },

  client: {
    url:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  },
};

module.exports = env;