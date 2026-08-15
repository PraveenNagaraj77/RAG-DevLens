const { z } = require("zod");

const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(150, "Project name must not exceed 150 characters"),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),
  }),

  params: z.object({}),
  query: z.object({}),
});

const updateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(150, "Project name must not exceed 150 characters"),

    description: z
      .string()
      .trim()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),
  }),

  params: z.object({
    id: z.string().uuid("Invalid project ID"),
  }),

  query: z.object({}),
});

const projectIdSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: z.string().uuid("Invalid project ID"),
  }),

  query: z.object({}),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
};