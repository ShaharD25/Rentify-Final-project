/*
Authentication service for frontend API calls.
Contains functions that communicate with the backend authentication routes,
such as login and future register requests.
Helps keep API logic separate from UI components.
*/

const API_BASE_URL = "http://localhost:5000/api/auth";

export async function loginUser(loginData) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await response.json();
  return data;
}

export async function registerUser(registerData) {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });

  const data = await response.json();
  return data;
}

export async function saveUserRole(roleData) {
  const response = await fetch(`${API_BASE_URL}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  });

  const data = await response.json();
  return data;
}