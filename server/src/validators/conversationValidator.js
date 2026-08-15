const { z } = require("zod");

const createConversationSchema = z.object({
  body: z.object({
    projectId: z
      .string()
      .uuid("Invalid project ID"),

    title: z
      .string()
      .trim()
      .max(255, "Title must not exceed 255 characters")
      .optional(),
  }),

  params: z.object({}),
  query: z.object({}),
});

module.exports = {
  createConversationSchema,
};