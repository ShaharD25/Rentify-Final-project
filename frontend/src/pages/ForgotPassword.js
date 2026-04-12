/*
Forgot password page.
Allows the user to enter an email address
and retrieve the saved security question.
*/

import { useState } from "react";
import {
    getSecurityQuestionByEmail, verifySecurityAnswer,
    resetUserPassword
} from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Reuse the same password strength rules as the registration flow.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAnswerVerified, setIsAnswerVerified] = useState(false);
    const [isSuccessMessage, setIsSuccessMessage] = useState(false);

    // Navigate back to the login page after a successful password reset.
    const navigate = useNavigate();

    async function handleGetQuestion(event) {
        event.preventDefault();
        setMessage("");
        setIsSuccessMessage(false);
        setSecurityQuestion("");
        setSecurityAnswer("");
        setNewPassword("");
        setConfirmPassword("");
        setIsAnswerVerified(false);
        setIsLoading(true);

        try {
            const result = await getSecurityQuestionByEmail({ email });

            if (result.success) {
                setSecurityQuestion(result.securityQuestion);
            } else {
                setEmail("");
                setMessage(result.message || "Failed to load security question.");
            }
        } catch (error) {
            setMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    // Verify the user's answer to the saved security question.
    async function handleVerifyAnswer(event) {
        event.preventDefault();
        setMessage("");
        setIsSuccessMessage(false);
        setIsLoading(true);

        try {
            const result = await verifySecurityAnswer({
                email,
                securityAnswer
            });

            if (result.success) {
                setIsAnswerVerified(true);
            } else {
                setSecurityAnswer("");
                setMessage(result.message || "Incorrect answer.");
            }
        } catch (error) {
            setMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    // Update the user's password after successful identity verification.
    async function handleResetPassword(event) {
        event.preventDefault();
        setMessage("");
        setIsSuccessMessage(false);
        if (!passwordRegex.test(newPassword)) {
            setNewPassword("");
            setConfirmPassword("");
            setMessage(
                "Password must be at least 8 characters long and include uppercase, lowercase, and a number."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setNewPassword("");
            setConfirmPassword("");
            setMessage("Password and confirmation do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetUserPassword({
                email,
                newPassword,
                confirmPassword
            });

            if (result.success) {
                setIsSuccessMessage(true);
                setMessage("Password updated successfully. You can now sign in.");

                setTimeout(() => {
                    navigate("/auth");
                }, 1500);
            } else {
                setIsSuccessMessage(false);
                setNewPassword("");
                setConfirmPassword("");
                setMessage(result.message || "Failed to update password.");
            }
        } catch (error) {
            setMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <div className="min-h-screen bg-[#FFE8D6] flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
            <div className="w-full max-w-md">
                <div className="bg-[#FFF8F3]/90 backdrop-blur-sm rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-orange-100 p-5 sm:p-8">
                    <div className="text-center mb-6">
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>
                        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                            Reset password
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your registered email address
                        </p>
                    </div>
                    {!securityQuestion && (
                        <form className="space-y-5" onSubmit={handleGetQuestion}>
                            <div>
                                <label
                                    htmlFor="forgot-email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email address
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isLoading}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Checking..." : "Continue"}
                            </button>
                        </form>
                    )}
                    {securityQuestion && !isAnswerVerified && (
                        <div className="mt-5">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Security question:
                            </p>

                            <div className="rounded-2xl border border-orange-100 bg-white px-4 py-4">
                                <p className="text-sm text-gray-900">{securityQuestion}</p>
                            </div>
                        </div>
                    )}

                    {/* Show the answer form after loading the security question */}
                    {securityQuestion && !isAnswerVerified && (
                        <form className="space-y-5 mt-5" onSubmit={handleVerifyAnswer}>
                            <div>
                                <label
                                    htmlFor="security-answer"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Your answer
                                </label>
                                <input
                                    id="security-answer"
                                    type="text"
                                    required
                                    value={securityAnswer}
                                    onChange={(event) => setSecurityAnswer(event.target.value)}
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
                                {isLoading ? "Verifying..." : "Verify answer"}
                            </button>
                        </form>
                    )}
                    {/* Show the new password form after successful answer verification */}
                    {securityQuestion && isAnswerVerified && (
                        <form className="space-y-5 mt-5" onSubmit={handleResetPassword}>
                            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                                <p className="text-sm text-center font-medium text-green-700">
                                    Identity verified. You can now set a new password.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="new-password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    New password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    disabled={isLoading}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                    placeholder="Enter a new password"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-new-password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Confirm new password
                                </label>
                                <input
                                    id="confirm-new-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    disabled={isLoading}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                    placeholder="Confirm your new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? "Updating..." : "Update password"}
                            </button>
                        </form>
                    )}

                    {message && (
                        <div
                            className={`mt-5 rounded-2xl border px-4 py-3 ${isSuccessMessage
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                                }`}
                        >
                            <p
                                className={`text-sm text-center font-medium ${isSuccessMessage ? "text-green-700" : "text-red-600"
                                    }`}
                            >
                                {message}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}