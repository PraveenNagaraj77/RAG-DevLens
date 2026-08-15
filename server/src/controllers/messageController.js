const pool = require("../config/db");
const { generateRAGAnswer } = require("../services/ragService");
const env = require("../config/env");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { conversationId } = req.params;
  const { message } = req.body;

  // 1. Validate message
  if (!message || !message.trim()) {
    throw new AppError("Message is required", 400);
  }

  // 2. Verify conversation belongs to authenticated user
  const conversationResult = await pool.query(
    `
    SELECT id, project_id
    FROM conversations
    WHERE id = $1
      AND user_id = $2
    `,
    [conversationId, userId]
  );

  if (conversationResult.rows.length === 0) {
    throw new AppError("Conversation not found", 404);
  }

  const conversation = conversationResult.rows[0];

  // 3. Get previous conversation history
  const historyResult = await pool.query(
    `
    SELECT
      role,
      content
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [conversationId, env.conversation.historyLimit]
  );

  const history = historyResult.rows.reverse();

  // 4. Save user message
  const userMessageResult = await pool.query(
    `
    INSERT INTO messages
      (conversation_id, role, content)
    VALUES
      ($1, 'user', $2)
    RETURNING
      id,
      conversation_id,
      role,
      content,
      created_at
    `,
    [conversationId, message.trim()]
  );

  // 5. Run RAG
  const ragResult = await generateRAGAnswer(
    message.trim(),
    conversation.project_id,
    history
  );

  // 6. Save assistant message
  const assistantMessageResult = await pool.query(
    `
    INSERT INTO messages
      (conversation_id, role, content)
    VALUES
      ($1, 'assistant', $2)
    RETURNING
      id,
      conversation_id,
      role,
      content,
      created_at
    `,
    [conversationId, ragResult.answer]
  );

  // 7. Update conversation timestamp
  await pool.query(
    `
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [conversationId]
  );

  // 8. Return response
  return res.status(200).json({
    success: true,
    message: "Message processed successfully",
    data: {
      userMessage: userMessageResult.rows[0],
      assistantMessage: assistantMessageResult.rows[0],
      sources: ragResult.sources,
    },
  });
});

module.exports = {
  sendMessage,
};