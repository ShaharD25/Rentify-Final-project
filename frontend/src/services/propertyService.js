/*
Property service for frontend API calls.
Contains functions that communicate with the backend property routes.
Helps keep property API logic separate from UI components.
*/

import API_BASE_URL from "./apiConfig";
//const API_BASE_URL = "http://localhost:5000/api/properties";
const PROPERTY_API_BASE_URL = `${API_BASE_URL}/properties`;

// Send a request to create a new property for the logged-in homeowner.
export async function createProperty(propertyData) {
    console.log("propertyService payload:", propertyData);

    const response = await fetch(PROPERTY_API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
    });

    console.log("propertyService response status:", response.status);

    const data = await response.json();
    console.log("propertyService response data:", data);

    return data;
}
// Request all properties that belong to one homeowner.
export async function getHomeownerProperties(homeownerId) {
    const response = await fetch(`${PROPERTY_API_BASE_URL}/homeowner/${homeownerId}`);

    const data = await response.json();
    return data;
}

// Request one property by id for the property details page.
export async function getPropertyById(propertyId) {
    const response = await fetch(`${PROPERTY_API_BASE_URL}/${propertyId}`);

    const data = await response.json();
    return data;
}

// Add one renter user to a selected property by email.
export async function addRenterToProperty(propertyId, renterEmail) {
    const response = await fetch(`${PROPERTY_API_BASE_URL}/${propertyId}/renters`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ renterEmail }),
    });

    const data = await response.json();
    return data;
}

// Remove one renter user from a selected property by id.
export async function removeRenterFromProperty(propertyId, renterId) {
    const response = await fetch(`${PROPERTY_API_BASE_URL}/${propertyId}/renters/remove`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ renterId }),
    });

    const data = await response.json();
    return data;
}

// Upload or replace a contract file for a selected property.
export async function uploadContractToProperty(propertyId, contractFile, uploadedBy) {
    const formData = new FormData();
    formData.append("contractFile", contractFile);
    formData.append("uploadedBy", uploadedBy);

    const response = await fetch(`${PROPERTY_API_BASE_URL}/${propertyId}/contract`, {
        method: "PUT",
        body: formData,
    });

    const data = await response.json();
    return data;
}

// Request all properties linked to one renter.
export async function getRenterProperties(renterId) {
    const response = await fetch(`${PROPERTY_API_BASE_URL}/renter/${renterId}`);

    const data = await response.json();
    return data;
}

// Link a renter to a property using a join code.
export async function joinPropertyByCode(joinData) {
    const response = await fetch(`${PROPERTY_API_BASE_URL}/join-by-code`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(joinData),
    });

    const data = await response.json();
    return data;
}