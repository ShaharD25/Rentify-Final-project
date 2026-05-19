/*
Bill service for frontend API calls.
Contains functions that communicate with backend bill routes.
*/

import API_BASE_URL from "./apiConfig";

const BILL_API_BASE_URL = `${API_BASE_URL}/bills`;

// Get all bills linked to one apartment.
export async function getApartmentBills(propertyId, renterId) {
    const response = await fetch(
        `${BILL_API_BASE_URL}/property/${propertyId}?renterId=${renterId}`
    );

    const data = await response.json();
    return data;
}

// Create a new bill for one apartment.
export async function createApartmentBill(propertyId, billData) {
    const response = await fetch(`${BILL_API_BASE_URL}/property/${propertyId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(billData)
    });

    const data = await response.json();
    return data;
}