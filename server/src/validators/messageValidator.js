const { z } = require("zod");

const sendMessageSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(10000, "Message must not exceed 10000 characters"),
  }),

  params: z.object({
    conversationId: z
      .string()
      .uuid("Invalid conversation ID"),
  }),

  query: z.object({}),
});

module.exports = {
  sendMessageSchema,
};