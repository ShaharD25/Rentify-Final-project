/*
Settings page.
Allows Homeowner and Renter users to update basic profile details.
*/

import { useEffect, useState } from "react";
import {
    getUserProfile,
    updateUserProfile
} from "../services/userService";

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        securityQuestion: ""
    });

    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadUserProfile() {
            const userId = sessionStorage.getItem("userId");

            if (!userId) {
                setPageMessage("No user session was found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getUserProfile(userId);

                if (result.success) {
                    setFormData({
                        firstName: result.user.firstName || "",
                        lastName: result.user.lastName || "",
                        email: result.user.email || "",
                        role: result.user.role || "",
                        securityQuestion: result.user.securityQuestion || ""
                    });
                } else {
                    setPageMessage(result.message || "Failed to load profile.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadUserProfile();
    }, []);

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    async function handleSaveProfile(event) {
        event.preventDefault();

        const userId = sessionStorage.getItem("userId");

        if (!userId) {
            setPageMessage("No user session was found. Please sign in again.");
            return;
        }

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            setPageMessage("First name, last name, and email are required.");
            return;
        }

        setIsSaving(true);
        setPageMessage("");

        try {
            const result = await updateUserProfile(userId, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email
            });

            if (result.success) {
                sessionStorage.setItem("firstName", result.user.firstName);
                setPageMessage("Profile updated successfully.");
                setFormData((prevData) => ({
                    ...prevData,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    email: result.user.email
                }));
            } else {
                setPageMessage(result.message || "Failed to update profile.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsSaving(false);
        }
    }

    function formatRole(role) {
        if (role === "homeowner") {
            return "Homeowner";
        }

        if (role === "renter") {
            return "Renter";
        }

        return role || "Not selected";
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6">
                <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                    Rentify
                </p>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Settings
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    Manage your basic account information.
                </p>
            </header>

            {pageMessage && (
                <div className="mb-5 rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">
                        {pageMessage}
                    </p>
                </div>
            )}

            {isLoading ? (
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-600">
                        Loading settings...
                    </p>
                </div>
            ) : (
                <form
                    onSubmit={handleSaveProfile}
                    className="max-w-3xl rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8"
                >
                    <h2 className="text-xl font-bold text-gray-900">
                        Profile details
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                First name
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Last name
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Role
                            </label>

                            <input
                                type="text"
                                value={formatRole(formData.role)}
                                disabled
                                className="w-full rounded-2xl border border-orange-100 bg-[#FFF3E8] px-4 py-3 text-sm font-semibold text-gray-700"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Security question
                            </label>

                            <input
                                type="text"
                                value={formData.securityQuestion || "Not set"}
                                disabled
                                className="w-full rounded-2xl border border-orange-100 bg-[#FFF3E8] px-4 py-3 text-sm font-semibold text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}