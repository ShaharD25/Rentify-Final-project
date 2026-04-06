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