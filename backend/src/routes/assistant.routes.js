const express = require("express");
const router = express.Router();

const {
    askAssistant,
    generateChatReplySuggestions
} = require("../controllers/assistant.controller");

/*
Ask smart assistant.
POST /api/assistant/ask
*/
router.post("/assistant/ask", askAssistant);

/*
Generate suggested replies for chat.
POST /api/assistant/chat-replies
*/
router.post("/assistant/chat-replies", generateChatReplySuggestions);

module.exports = router;