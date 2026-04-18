/*
Authentication service for frontend API calls.
Contains functions that communicate with the backend authentication routes,
such as login and future register requests.
Helps keep API logic separate from UI components.
*/

// const API_BASE_URL = "http://localhost:5000/api/auth";
import API_BASE_URL from "./apiConfig";
const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`;

export async function loginUser(loginData) {
  const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
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
  const response = await fetch(`${AUTH_API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });

  const data = await response.json();
  return data;
}


// Send the selected user role to the backend.
export async function saveUserRole(roleData) {
  const response = await fetch(`${AUTH_API_BASE_URL}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  });

  const data = await response.json();
  return data;
}

// Request the security question for the given email.
export async function getSecurityQuestionByEmail(emailData) {
  const response = await fetch(`${AUTH_API_BASE_URL}/forgot-password/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  const data = await response.json();
  return data;
}

// Verify the answer to the user's security question.
export async function verifySecurityAnswer(answerData) {
  const response = await fetch(`${AUTH_API_BASE_URL}/forgot-password/verify-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answerData),
  });

  const data = await response.json();
  return data;
}

// Send the new password to the backend after successful verification.
export async function resetUserPassword(passwordData) {
  const response = await fetch(`${AUTH_API_BASE_URL}/forgot-password/reset`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();
  return data;
}