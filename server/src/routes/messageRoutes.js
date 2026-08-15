const express = require("express");

const {
  sendMessage,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  sendMessageSchema,
} = require("../validators/messageValidator");

const router = express.Router();

router.post(
  "/:conversationId",
  authMiddleware,
  validate(sendMessageSchema),
  sendMessage
);

module.exports = router;