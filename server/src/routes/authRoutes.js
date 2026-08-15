const express = require("express");

const { login } = require("../controllers/authController");
const validate = require("../middleware/validateMiddleware");
const { loginSchema } = require("../validators/authValidator");
const {
  loginRateLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  login
);

module.exports = router;