/*
Roommate service for frontend API calls.
Contains functions that communicate with backend roommate routes.
*/

import API_BASE_URL from "./apiConfig";

const ROOMMATE_API_BASE_URL = `${API_BASE_URL}/roommates`;

// Get all roommates for one apartment.
export async function getApartmentRoommates(propertyId, renterId) {
    const response = await fetch(
        `${ROOMMATE_API_BASE_URL}/property/${propertyId}?renterId=${renterId}`
    );

    const data = await response.json();
    return data;
}

// Generate a join code for one apartment.
export async function generateApartmentJoinCode(propertyId, renterId) {
    const response = await fetch(
        `${ROOMMATE_API_BASE_URL}/property/${propertyId}/join-code`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ renterId })
        }
    );

    const data = await response.json();
    return data;
}

// Join an apartment using a join code.
export async function joinApartmentByCode(renterId, renterJoinCode) {
    const response = await fetch(`${ROOMMATE_API_BASE_URL}/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            renterId,
            renterJoinCode
        })
    });

    const data = await response.json();
    return data;
}