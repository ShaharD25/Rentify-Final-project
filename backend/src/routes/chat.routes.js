const express = require("express");
const router = express.Router();
const uploadChatFile = require("../middlewares/uploadChatFile.middleware");

const {
    getPropertyChat,
    sendMessage,
    markChatAsRead,
    getHomeownerChats,
    getRenterChats,
    getUnreadChatCount
} = require("../controllers/chat.controller");


/*
Get all chats for one Homeowner.
GET /api/chats/homeowner/:homeownerId
*/
router.get("/chats/homeowner/:homeownerId", getHomeownerChats);

/*
Get all chats for one Renter.
GET /api/chats/renter/:renterId
*/
router.get("/chats/renter/:renterId", getRenterChats);

/*
Get unread chat message count for one user.
GET /api/chats/user/:userId/unread-count?role=homeowner/renter
*/
router.get("/chats/user/:userId/unread-count", getUnreadChatCount);

/*
Get or create property chat.
GET /api/chats/property/:propertyId?userId=...&role=...
*/
router.get("/chats/property/:propertyId", getPropertyChat);

/*
Send message in property chat.
POST /api/chats/property/:propertyId/messages
*/
router.post(
    "/chats/property/:propertyId/messages",
    uploadChatFile.single("chatFile"),
    sendMessage
);

/*
Mark property chat as read.
PUT /api/chats/property/:propertyId/read
*/
router.put("/chats/property/:propertyId/read", markChatAsRead);

module.exports = router;