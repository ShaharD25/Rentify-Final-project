/*
Chat service for frontend API calls.
Contains functions that communicate with backend chat routes.
*/

import API_BASE_URL from "./apiConfig";

const CHAT_API_BASE_URL = `${API_BASE_URL}/chats`;

// Get or create a property chat.
export async function getPropertyChat(propertyId, userId, role) {
    const response = await fetch(
        `${CHAT_API_BASE_URL}/property/${propertyId}?userId=${userId}&role=${role}`
    );

    const data = await response.json();
    return data;
}

// Send a text message or file message in a property chat.
export async function sendPropertyChatMessage(propertyId, messageData) {
    const formData = new FormData();

    formData.append("senderId", messageData.senderId);
    formData.append("senderRole", messageData.senderRole);
    formData.append("text", messageData.text || "");

    if (messageData.chatFile) {
        formData.append("chatFile", messageData.chatFile);
    }

    const response = await fetch(`${CHAT_API_BASE_URL}/property/${propertyId}/messages`, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    return data;
}

// Mark a property chat as read.
export async function markPropertyChatAsRead(propertyId, readData) {
    const response = await fetch(`${CHAT_API_BASE_URL}/property/${propertyId}/read`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(readData)
    });

    const data = await response.json();
    return data;
}

// Get all chats for one Homeowner.
export async function getHomeownerChats(homeownerId) {
    const response = await fetch(`${CHAT_API_BASE_URL}/homeowner/${homeownerId}`);

    const data = await response.json();
    return data;
}

// Get all chats for one Renter.
export async function getRenterChats(renterId) {
    const response = await fetch(`${CHAT_API_BASE_URL}/renter/${renterId}`);

    const data = await response.json();
    return data;
}

// Get unread chat message count for one user.
export async function getUnreadChatCount(userId, role) {
    const response = await fetch(
        `${CHAT_API_BASE_URL}/user/${userId}/unread-count?role=${role}`
    );

    const data = await response.json();
    return data;
}