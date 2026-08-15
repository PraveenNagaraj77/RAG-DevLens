const pool = require("../config/db");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const createConversation = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { projectId, title } = req.body;

  // Validate project ID
  if (!projectId) {
    throw new AppError("Project ID is required", 400);
  }

  // Verify project ownership
  const projectResult = await pool.query(
    `
    SELECT id
    FROM projects
    WHERE id = $1
      AND user_id = $2
    `,
    [projectId, userId]
  );

  if (projectResult.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  // Create conversation
  const result = await pool.query(
    `
    INSERT INTO conversations
      (user_id, project_id, title)
    VALUES
      ($1, $2, $3)
    RETURNING
      id,
      user_id,
      project_id,
      title,
      created_at,
      updated_at
    `,
    [
      userId,
      projectId,
      title || "New Conversation",
    ]
  );

  return res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    data: result.rows[0],
  });
});

module.exports = {
  createConversation,
};