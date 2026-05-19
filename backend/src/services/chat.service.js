const Chat = require("../models/chat.model");
const Property = require("../models/property.model");
const User = require("../models/user");

/*
Check whether a user is allowed to access a property chat.
Supports both populated objects and raw ObjectId values.
*/
function isUserAllowedInPropertyChat(property, userId, role) {
    if (role === "homeowner") {
        const homeownerId = property.homeowner?._id || property.homeowner;

        return homeownerId?.toString() === userId.toString();
    }

    if (role === "renter") {
        return (property.renters || []).some((renterItem) => {
            const renterUser = renterItem.renter || renterItem;
            const renterId = renterUser?._id || renterUser;

            return renterId?.toString() === userId.toString();
        });
    }

    return false;
}

/*
Get or create a chat for one property.
*/
async function getOrCreatePropertyChat(propertyId, userId, role) {
    const property = await Property.findById(propertyId)
        .populate("homeowner", "firstName lastName email role")
        .populate("renters.renter", "firstName lastName email role");

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const isAllowed = isUserAllowedInPropertyChat(property, userId, role);

    if (!isAllowed) {
        return {
            success: false,
            message: "You are not allowed to access this chat."
        };
    }

    let chat = await Chat.findOne({ property: propertyId })
        .populate("messages.sender", "firstName lastName email role")
        .populate("messages.readBy.user", "firstName lastName email role");

    if (!chat) {
        chat = new Chat({
            property: propertyId,
            messages: []
        });

        await chat.save();

        chat = await Chat.findOne({ property: propertyId })
            .populate("messages.sender", "firstName lastName email role")
            .populate("messages.readBy.user", "firstName lastName email role");
    }

    return {
        success: true,
        chat,
        property
    };
}

/*
Send a new chat message.
Supports text and optional uploaded file.
*/
async function sendMessage(messageData) {
    const {
        propertyId,
        senderId,
        senderRole,
        text,
        fileUrl,
        fileName,
        fileType
    } = messageData;

    const sender = await User.findById(senderId);

    if (!sender) {
        return {
            success: false,
            message: "Sender not found."
        };
    }

    const chatResult = await getOrCreatePropertyChat(
        propertyId,
        senderId,
        senderRole
    );

    if (!chatResult.success) {
        return chatResult;
    }

    const chat = chatResult.chat;
    const senderName = `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || sender.email;

    if (!text && !fileUrl) {
        return {
            success: false,
            message: "Message text or file is required."
        };
    }

    chat.messages.push({
        sender: senderId,
        senderRole,
        senderName,
        text: text ? text.trim() : "",
        fileUrl: fileUrl || "",
        fileName: fileName || "",
        fileType: fileType || "",
        readBy: [
            {
                user: senderId,
                readAt: new Date()
            }
        ]
    });

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
        .populate("messages.sender", "firstName lastName email role")
        .populate("messages.readBy.user", "firstName lastName email role");

    return {
        success: true,
        message: "Message sent successfully.",
        chat: updatedChat
    };
}

/*
Mark chat messages as read by one user.
*/
async function markChatAsRead(propertyId, userId, role) {
    const chatResult = await getOrCreatePropertyChat(propertyId, userId, role);

    if (!chatResult.success) {
        return chatResult;
    }

    const chat = chatResult.chat;

    chat.messages.forEach((message) => {
        const alreadyRead = (message.readBy || []).some((readItem) => {
            const readUserId = readItem.user._id || readItem.user;
            return readUserId.toString() === userId.toString();
        });

        if (!alreadyRead) {
            message.readBy.push({
                user: userId,
                readAt: new Date()
            });
        }
    });

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
        .populate("messages.sender", "firstName lastName email role")
        .populate("messages.readBy.user", "firstName lastName email role");

    return {
        success: true,
        chat: updatedChat
    };
}

/*
Count unread messages in one chat for one user.
A message is unread if it was not sent by the user and the user is not in readBy.
*/
function countUnreadMessagesForUser(messages, userId) {
    return (messages || []).filter((message) => {
        const senderId = message.sender?._id || message.sender;

        if (senderId?.toString() === userId.toString()) {
            return false;
        }

        const wasRead = (message.readBy || []).some((readItem) => {
            const readUserId = readItem.user?._id || readItem.user;
            return readUserId?.toString() === userId.toString();
        });

        return !wasRead;
    }).length;
}

/*
Build a short chat preview object for the chat list.
*/
function buildChatPreview(property, chat, userId) {
    const messages = chat?.messages || [];
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return {
        property: {
            _id: property._id,
            fullAddress: property.fullAddress
        },
        lastMessage,
        unreadCount: countUnreadMessagesForUser(messages, userId)
    };
}

/*
Get all property chats for one Homeowner.
Each chat is grouped by property address.
*/
async function getHomeownerChats(homeownerId) {
    const homeowner = await User.findById(homeownerId);

    if (!homeowner) {
        return {
            success: false,
            message: "Homeowner not found."
        };
    }

    if (homeowner.role !== "homeowner") {
        return {
            success: false,
            message: "Only a homeowner can view these chats."
        };
    }

    const properties = await Property.find({ homeowner: homeownerId })
        .sort({ createdAt: -1 });

    const chats = [];

    for (const property of properties) {
        const chat = await Chat.findOne({ property: property._id })
            .populate("messages.sender", "firstName lastName email role")
            .populate("messages.readBy.user", "firstName lastName email role");

        chats.push(buildChatPreview(property, chat, homeownerId));
    }

    return {
        success: true,
        chats
    };
}

/*
Get all property chats for one Renter.
Each chat belongs to an apartment linked to the renter.
*/
async function getRenterChats(renterId) {
    const renter = await User.findById(renterId);

    if (!renter) {
        return {
            success: false,
            message: "Renter not found."
        };
    }

    if (renter.role !== "renter") {
        return {
            success: false,
            message: "Only a renter can view these chats."
        };
    }

    const properties = await Property.find({ "renters.renter": renterId })
        .sort({ createdAt: -1 });

    const chats = [];

    for (const property of properties) {
        const chat = await Chat.findOne({ property: property._id })
            .populate("messages.sender", "firstName lastName email role")
            .populate("messages.readBy.user", "firstName lastName email role");

        chats.push(buildChatPreview(property, chat, renterId));
    }

    return {
        success: true,
        chats
    };
}

/*
Get total unread chat messages for one user by role.
*/
async function getUnreadChatCount(userId, role) {
    const result =
        role === "homeowner"
            ? await getHomeownerChats(userId)
            : await getRenterChats(userId);

    if (!result.success) {
        return result;
    }

    const count = result.chats.reduce((sum, chat) => {
        return sum + (chat.unreadCount || 0);
    }, 0);

    return {
        success: true,
        count
    };
}

module.exports = {
    getOrCreatePropertyChat,
    sendMessage,
    markChatAsRead,
    getHomeownerChats,
    getRenterChats,
    getUnreadChatCount
};