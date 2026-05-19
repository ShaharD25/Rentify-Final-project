/*
Notification service for frontend API calls.
Contains functions that communicate with backend notification routes.
*/

import API_BASE_URL from "./apiConfig";

const NOTIFICATION_API_BASE_URL = `${API_BASE_URL}/notifications`;

// Send a property invitation from a homeowner to a renter.
export async function createPropertyInvitation(invitationData) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/property-invitation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(invitationData),
    });

    const data = await response.json();
    return data;
}

// Get all notifications for one renter.
export async function getRenterNotifications(renterId) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/renter/${renterId}`);

    const data = await response.json();
    return data;
}

// Get unread notification count for one user.
export async function getUnreadNotificationCount(userId) {
    const response = await fetch(
        `${NOTIFICATION_API_BASE_URL}/user/${userId}/unread-count`
    );

    const data = await response.json();
    return data;
}

// Mark one notification as read.
export async function markNotificationAsRead(notificationId) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/${notificationId}/read`, {
        method: "PUT",
    });

    const data = await response.json();
    return data;
}

// Accept a property invitation.
export async function acceptPropertyInvitation(notificationId, renterId) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/${notificationId}/accept`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ renterId }),
    });

    const data = await response.json();
    return data;
}

// Decline a property invitation.
export async function declinePropertyInvitation(notificationId, renterId) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/${notificationId}/decline`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ renterId }),
    });

    const data = await response.json();
    return data;
}

// Get all notifications for one user.
export async function getUserNotifications(userId) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/user/${userId}`);

    const data = await response.json();
    return data;
}

// Get one notification by id.
export async function getNotificationById(notificationId, userId) {
    const response = await fetch(
        `${NOTIFICATION_API_BASE_URL}/${notificationId}?userId=${userId}`
    );

    const data = await response.json();
    return data;
}