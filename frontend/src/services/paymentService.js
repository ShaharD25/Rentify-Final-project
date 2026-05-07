/*
Payment service for frontend API calls.
Contains functions that communicate with the backend payment routes.
*/

import API_BASE_URL from "./apiConfig";

const PAYMENT_API_BASE_URL = `${API_BASE_URL}/payments`;

// Generate monthly payment records for all renters.
export async function generateMonthlyPayments(paymentData) {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    return data;
}

// Get all payments for one homeowner.
export async function getHomeownerPayments(homeownerId) {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/homeowner/${homeownerId}`);
    const data = await response.json();
    return data;
}

// Update one payment status.
export async function updatePaymentStatus(paymentId, status) {
    const response = await fetch(`${PAYMENT_API_BASE_URL}/${paymentId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
}

// Get payment history for one renter.
export async function getRenterPaymentHistory(homeownerId, renterName) {
    const encodedRenterName = encodeURIComponent(renterName);

    const response = await fetch(
        `${PAYMENT_API_BASE_URL}/homeowner/${homeownerId}/renter/${encodedRenterName}/history`
    );

    const data = await response.json();
    return data;
}

// Get monthly income analytics for one homeowner.
export async function getIncomeAnalytics(homeownerId) {
    const response = await fetch(
        `${PAYMENT_API_BASE_URL}/homeowner/${homeownerId}/analytics/income`
    );

    const data = await response.json();
    return data;
}