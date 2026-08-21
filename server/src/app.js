const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const documentRoutes = require("./routes/documentRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const healthRoutes = require("./routes/healthRoutes");

const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./config/swagger");



const {
  apiRateLimiter,
} = require("./middleware/rateLimitMiddleware");



const app = express();

// Security middleware
app.use(helmet());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://rag-dev-lens.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, curl, server-to-server requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "1mb" }));

// Health Check
app.use("/api/health",healthRoutes);


//Swagger 
app.use("/api/docs",swaggerUi.serve,swaggerUi.setup(swaggerDocument));

// Global API rate limiter
app.use(apiRateLimiter);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);




// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;