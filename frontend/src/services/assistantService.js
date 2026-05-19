/*
Assistant service for frontend API calls.
Contains functions that communicate with backend assistant routes.
*/

import API_BASE_URL from "./apiConfig";

const ASSISTANT_API_BASE_URL = `${API_BASE_URL}/assistant`;

// Ask the smart assistant a question.
export async function askAssistant(assistantData) {
    const response = await fetch(`${ASSISTANT_API_BASE_URL}/ask`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(assistantData)
    });

    const data = await response.json();
    return data;
}

// Generate suggested chat replies.
export async function getChatReplySuggestions(propertyId, userId, role) {
    const response = await fetch(`${ASSISTANT_API_BASE_URL}/chat-replies`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            propertyId,
            userId,
            role
        })
    });

    const data = await response.json();
    return data;
}