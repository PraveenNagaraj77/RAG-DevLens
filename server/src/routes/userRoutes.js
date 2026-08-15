const express = require("express");

const { createUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createUserSchema } = require("../validators/userValidator");

const router = express.Router();

router.post(
  "/",
  validate(createUserSchema),
  createUser
);

router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Authenticated user",
      user: req.user,
    });
  }
);

module.exports = router;