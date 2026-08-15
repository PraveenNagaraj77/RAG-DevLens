const express = require("express");

const {
  createConversation,
} = require("../controllers/conversationController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createConversationSchema,
} = require("../validators/conversationValidator");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate(createConversationSchema),
  createConversation
);

module.exports = router;