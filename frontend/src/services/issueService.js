/*
Issue service for frontend API calls.
Contains functions that communicate with the backend issue routes.
Helps keep issue API logic separate from UI components.
*/

import API_BASE_URL from "./apiConfig";

const ISSUE_API_BASE_URL = `${API_BASE_URL}/issues`;

// Create a new issue.
export async function createIssue(issueData) {
    const response = await fetch(ISSUE_API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
    });

    const data = await response.json();
    return data;
}

// Get all issues for one homeowner.
export async function getHomeownerIssues(homeownerId) {
    const response = await fetch(`${ISSUE_API_BASE_URL}/homeowner/${homeownerId}`);
    const data = await response.json();
    return data;
}

// Get all issues for one property.
export async function getPropertyIssues(propertyId) {
    const response = await fetch(`${ISSUE_API_BASE_URL}/property/${propertyId}`);
    const data = await response.json();
    return data;
}

// Get one issue by id.
export async function getIssueById(issueId) {
    const response = await fetch(`${ISSUE_API_BASE_URL}/${issueId}`);
    const data = await response.json();
    return data;
}

// Update one issue status.
export async function updateIssueStatus(issueId, status) {
    const response = await fetch(`${ISSUE_API_BASE_URL}/${issueId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
}

// Add a message to an issue thread.
export async function addIssueMessage(issueId, messageData) {
    const response = await fetch(`${ISSUE_API_BASE_URL}/${issueId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
    });

    const data = await response.json();
    return data;
}