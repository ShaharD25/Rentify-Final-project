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

// Add one renter name to a selected property.
export async function addRenterToProperty(propertyId, renterName) {
  const response = await fetch(`${PROPERTY_API_BASE_URL}/${propertyId}/renters`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ renterName }),
  });

  const data = await response.json();
  return data;
}