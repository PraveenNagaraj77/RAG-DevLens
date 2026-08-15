const bcrypt = require("bcrypt");
const pool = require("../config/db");

const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError(
      "User with this email already exists",
      409
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
    `,
    [name, email, passwordHash]
  );

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: result.rows[0],
  });
});

module.exports = {
  createUser,
};