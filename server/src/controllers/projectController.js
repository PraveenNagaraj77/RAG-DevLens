const pool = require("../config/db");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// Create project
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.userId;

  const result = await pool.query(
    `
    INSERT INTO projects (user_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, name, description, created_at, updated_at
    `,
    [userId, name.trim(), description || null],
  );

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: result.rows[0],
  });
});
// Get all projects for logged-in user
const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    `
    SELECT id, name, description, created_at, updated_at
    FROM projects
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId],
  );

  return res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// Get single project
const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const result = await pool.query(
    `
    SELECT id, name, description, created_at, updated_at
    FROM projects
    WHERE id = $1 AND user_id = $2
    `,
    [id, userId],
  );

  if (result.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

// Update project
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.userId;

  if (!name || !name.trim()) {
    throw new AppError("Project name is required", 400);
  }

  const result = await pool.query(
    `
    UPDATE projects
    SET name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND user_id = $4
    RETURNING id, name, description, created_at, updated_at
    `,
    [name.trim(), description || null, id, userId],
  );

  if (result.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: result.rows[0],
  });
});

// Delete project
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const result = await pool.query(
    `
    DELETE FROM projects
    WHERE id = $1 AND user_id = $2
    RETURNING id
    `,
    [id, userId],
  );

  if (result.rows.length === 0) {
    throw new AppError("Project not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
