/*
User service for frontend API calls.
Contains functions that communicate with backend user routes.
*/

import API_BASE_URL from "./apiConfig";

const USER_API_BASE_URL = `${API_BASE_URL}/users`;

// Get one user profile.
export async function getUserProfile(userId) {
    const response = await fetch(`${USER_API_BASE_URL}/${userId}/profile`);

    const data = await response.json();
    return data;
}

// Update one user profile.
export async function updateUserProfile(userId, profileData) {
    const response = await fetch(`${USER_API_BASE_URL}/${userId}/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
    });

    const data = await response.json();
    return data;
}