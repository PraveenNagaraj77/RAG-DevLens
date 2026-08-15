const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "DevLens API",
    version: "1.0.0",
    description:
      "AI-powered code and documentation assistant API",
  },

  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Health",
      description: "API health and readiness checks",
    },
    {
      name: "Authentication",
      description: "Authentication endpoints",
    },
    {
      name: "Users",
      description: "User endpoints",
    },
    {
      name: "Projects",
      description: "Project management endpoints",
    },
    {
      name: "Documents",
      description: "Document upload endpoints",
    },
    {
      name: "Conversations",
      description: "Conversation endpoints",
    },
    {
      name: "Messages",
      description: "AI conversation endpoints",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Internal server error",
          },
        },
      },

      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          name: {
            type: "string",
            example: "Praveen",
          },
          email: {
            type: "string",
            format: "email",
            example: "praveen@example.com",
          },
        },
      },

      Project: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          user_id: {
            type: "string",
            format: "uuid",
          },
          name: {
            type: "string",
            example: "DevLens",
          },
          description: {
            type: "string",
            example: "AI code documentation assistant",
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          updated_at: {
            type: "string",
            format: "date-time",
          },
        },
      },

      Conversation: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          user_id: {
            type: "string",
            format: "uuid",
          },
          project_id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
            example: "DevLens Documentation Chat",
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          updated_at: {
            type: "string",
            format: "date-time",
          },
        },
      },

      Message: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          conversation_id: {
            type: "string",
            format: "uuid",
          },
          role: {
            type: "string",
            enum: ["user", "assistant"],
          },
          content: {
            type: "string",
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
  },

  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          200: {
            description: "API is running",
          },
        },
      },
    },

    "/api/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Check API readiness",
        responses: {
          200: {
            description: "All required services are available",
          },
          503: {
            description: "One or more services are unavailable",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "praveen@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "Password123",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Login successful",
          },
          400: {
            description: "Validation error",
          },
          401: {
            description: "Invalid credentials",
          },
        },
      },
    },

    "/api/users": {
      post: {
        tags: ["Users"],
        summary: "Create a user",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: {
                    type: "string",
                    example: "Praveen",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "praveen@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "Password123",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "User created successfully",
          },
          400: {
            description: "Validation error",
          },
          409: {
            description: "User already exists",
          },
        },
      },
    },

    "/api/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get authenticated user profile",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Authenticated user",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "Get all projects",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Projects retrieved successfully",
          },
        },
      },

      post: {
        tags: ["Projects"],
        summary: "Create project",
        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    example: "DevLens",
                  },
                  description: {
                    type: "string",
                    example: "AI code documentation assistant",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Project created successfully",
          },
          400: {
            description: "Validation error",
          },
        },
      },
    },

    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get project by ID",
        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        responses: {
          200: {
            description: "Project retrieved successfully",
          },
          404: {
            description: "Project not found",
          },
        },
      },

      put: {
        tags: ["Projects"],
        summary: "Update project",
        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                  },
                  description: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Project updated successfully",
          },
          404: {
            description: "Project not found",
          },
        },
      },

      delete: {
        tags: ["Projects"],
        summary: "Delete project",
        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        responses: {
          200: {
            description: "Project deleted successfully",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    },

    "/api/documents/projects/{projectId}/upload": {
      post: {
        tags: ["Documents"],
        summary: "Upload project document",
        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Document uploaded successfully",
          },
          400: {
            description: "Invalid upload",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    },

    "/api/conversations": {
      post: {
        tags: ["Conversations"],
        summary: "Create conversation",
        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["projectId"],
                properties: {
                  projectId: {
                    type: "string",
                    format: "uuid",
                  },
                  title: {
                    type: "string",
                    example: "DevLens Documentation Chat",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Conversation created successfully",
          },
          404: {
            description: "Project not found",
          },
        },
      },
    },

    "/api/messages/{conversationId}": {
      post: {
        tags: ["Messages"],
        summary: "Send message to DevLens",
        security: [
          {
            bearerAuth: [],
          },
        ],

        parameters: [
          {
            name: "conversationId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: {
                    type: "string",
                    example: "What is DevLens?",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Message processed successfully",
          },
          404: {
            description: "Conversation not found",
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;