const chatService = require("../services/chat.service");

/*
Get or create a property chat.
*/
async function getPropertyChat(req, res) {
    const { propertyId } = req.params;
    const { userId, role } = req.query;

    if (!propertyId || !userId || !role) {
        return res.status(400).json({
            success: false,
            message: "Property id, user id, and role are required."
        });
    }

    const result = await chatService.getOrCreatePropertyChat(
        propertyId,
        userId,
        role
    );

    return res.status(result.success ? 200 : 403).json(result);
}

/*
Send a chat message.
*/
async function sendMessage(req, res) {
    const { propertyId } = req.params;
    const {
        senderId,
        senderRole,
        text
    } = req.body;

    if (!propertyId || !senderId || !senderRole) {
        return res.status(400).json({
            success: false,
            message: "Property id, sender id, and sender role are required."
        });
    }

    const fileUrl = req.file ? `/uploads/chat/${req.file.filename}` : "";
    const fileName = req.file ? req.file.originalname : "";
    const fileType = req.file ? req.file.mimetype : "";

    const result = await chatService.sendMessage({
        propertyId,
        senderId,
        senderRole,
        text: text || "",
        fileUrl,
        fileName,
        fileType
    });

    return res.status(result.success ? 201 : 400).json(result);
}

/*
Mark property chat as read by one user.
*/
async function markChatAsRead(req, res) {
    const { propertyId } = req.params;
    const { userId, role } = req.body;

    if (!propertyId || !userId || !role) {
        return res.status(400).json({
            success: false,
            message: "Property id, user id, and role are required."
        });
    }

    const result = await chatService.markChatAsRead(propertyId, userId, role);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get all chats for one Homeowner.
*/
async function getHomeownerChats(req, res) {
    const { homeownerId } = req.params;

    if (!homeownerId) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id is required."
        });
    }

    const result = await chatService.getHomeownerChats(homeownerId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get all chats for one Renter.
*/
async function getRenterChats(req, res) {
    const { renterId } = req.params;

    if (!renterId) {
        return res.status(400).json({
            success: false,
            message: "Renter id is required."
        });
    }

    const result = await chatService.getRenterChats(renterId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get unread chat message count for one user.
*/
async function getUnreadChatCount(req, res) {
    const { userId } = req.params;
    const { role } = req.query;

    if (!userId || !role) {
        return res.status(400).json({
            success: false,
            message: "User id and role are required."
        });
    }

    const result = await chatService.getUnreadChatCount(userId, role);

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    getPropertyChat,
    sendMessage,
    markChatAsRead,
    getHomeownerChats,
    getRenterChats,
    getUnreadChatCount
};