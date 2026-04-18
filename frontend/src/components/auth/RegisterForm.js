/*
RegisterForm component.
Displays the registration form UI for creating a new account.
Currently responsible only for rendering the input fields and submit button.
Registration logic, form state handling, and backend connection will be added separately.
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

// Registration form step inside the auth flow.
export default function RegisterForm() {
    const nameRegex = /^[A-Za-z]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Navigate to the next page after successful registration.
    const navigate = useNavigate();

    const [registerForm, setRegisterForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        securityQuestion: "",
        securityAnswer: "",
    });

    const [registerMessage, setRegisterMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setRegisterForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    }

    async function handleRegisterSubmit(event) {
        event.preventDefault();
        setRegisterMessage("");
        setIsSuccess(false);

        if (!nameRegex.test(registerForm.firstName.trim())) {
            setRegisterMessage("First name must contain English letters only.");
            return;
        }

        if (!nameRegex.test(registerForm.lastName.trim())) {
            setRegisterMessage("Last name must contain English letters only.");
            return;
        }

        if (!passwordRegex.test(registerForm.password)) {
            setRegisterMessage(
                "Password must be at least 8 characters long and include uppercase, lowercase, and a number."
            );
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            setRegisterMessage("Password and confirmation do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await registerUser(registerForm);

            if (result.success) {
                // Get the new user's id from the backend response.
                const registeredUserId = result.user?.id;

                setRegisterForm({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    securityQuestion: "",
                    securityAnswer: "",
                });

                // Store the user id temporarily for the role selection step.
                if (registeredUserId) {
                    sessionStorage.setItem("pendingUserId", registeredUserId);
                }

                // Store the first name for the next onboarding step.
                sessionStorage.setItem("firstName", registerForm.firstName);

                // Move to the role selection page after successful registration.
                navigate("/role-selection");
            } else {
                setIsSuccess(false);
                setRegisterMessage(result.message || "Registration failed");
            }
        }
        catch (error) {
            setIsSuccess(false);
            setRegisterMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <form className="space-y-5" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="first-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        First name
                    </label>
                    <input
                        id="first-name"
                        name="firstName"
                        type="text"
                        required
                        value={registerForm.firstName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                        placeholder="First name"
                    />
                </div>

                <div>
                    <label
                        htmlFor="last-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Last name
                    </label>
                    <input
                        id="last-name"
                        name="lastName"
                        type="text"
                        required
                        value={registerForm.lastName}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                        placeholder="Last name"
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="register-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Email address
                </label>
                <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="Enter your email"
                />
            </div>

            <div>
                <label
                    htmlFor="register-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Password
                </label>
                <input
                    id="register-password"
                    name="password"
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="Create a password"
                />
            </div>

            <div>
                <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Confirm password
                </label>
                <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="Confirm your password"
                />
            </div>

            <div>
                <label
                    htmlFor="security-question"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Security question
                </label>
                <input
                    id="security-question"
                    name="securityQuestion"
                    type="text"
                    required
                    value={registerForm.securityQuestion}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="Enter a security question"
                />
            </div>

            <div>
                <label
                    htmlFor="security-answer"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Security answer
                </label>
                <input
                    id="security-answer"
                    name="securityAnswer"
                    type="text"
                    required
                    value={registerForm.securityAnswer}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="Enter your answer"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
                <span className="flex items-center justify-center gap-2">
                    {isLoading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    )}
                    {isLoading ? "Creating account..." : "Create account"}
                </span>
            </button>

            {registerMessage && (
                <div
                    className={`rounded-2xl border px-4 py-3 ${isSuccess
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                        }`}
                >
                    <p
                        className={`text-sm text-center font-medium ${isSuccess ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {registerMessage}
                    </p>
                </div>
            )}

        </form>
    );
}