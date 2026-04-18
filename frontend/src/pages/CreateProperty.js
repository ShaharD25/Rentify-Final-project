/*
Create property page.
Allows the homeowner to enter the main property details
before saving a new property to the system.
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "../services/propertyService";

export default function CreateProperty() {
    // Navigate back to the homeowner dashboard after actions.
    const navigate = useNavigate();

    // Store all property form values in one state object.
    const [propertyForm, setPropertyForm] = useState({
        fullAddress: "",
        monthlyRent: "",
        billingDate: "",
        rentalStartDate: "",
        rentalEndDate: "",
    });

    // Store validation or info messages shown under the form.
    const [formMessage, setFormMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Update the matching field whenever the user types.
    function handleInputChange(event) {
        const { name, value } = event.target;

        setPropertyForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    }

    // Validate required fields before backend connection is added.
    async function handleSubmit(event) {
        event.preventDefault();
        setFormMessage("");

        if (
            !propertyForm.fullAddress ||
            !propertyForm.monthlyRent ||
            !propertyForm.billingDate ||
            !propertyForm.rentalStartDate ||
            !propertyForm.rentalEndDate
        ) {
            setFormMessage("Please fill in all required fields.");
            return;
        }

        if (propertyForm.rentalEndDate < propertyForm.rentalStartDate) {
            setFormMessage("End date must be later than start date.");
            return;
        }

        const homeownerId = sessionStorage.getItem("userId");

        if (!homeownerId) {
            setFormMessage("No homeowner session was found. Please sign in again.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await createProperty({
                ...propertyForm,
                homeownerId,
            });

            if (result.success) {
                navigate("/homeowner");
            } else {
                setFormMessage(result.message || "Failed to create property.");
            }
        } catch (error) {
            console.error("Create property error:", error);
            setFormMessage(`Server error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FFE8D6] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Add new property
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter the main details of the property you want to manage
                        </p>
                    </div>

                    {/* Desktop back button */}
                    <button
                        type="button"
                        onClick={() => navigate("/homeowner")}
                        className="hidden rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:block"
                    >
                        Back
                    </button>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="full-address"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Full address <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="full-address"
                                name="fullAddress"
                                type="text"
                                value={propertyForm.fullAddress}
                                onChange={handleInputChange}
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                placeholder="Enter full property address"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="monthly-rent"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Monthly rent (₪) <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                                        ₪
                                    </span>

                                    <input
                                        id="monthly-rent"
                                        name="monthlyRent"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={propertyForm.monthlyRent}
                                        onChange={handleInputChange}
                                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                        placeholder="Enter monthly rent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="billing-date"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Billing date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="billing-date"
                                    name="billingDate"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={propertyForm.billingDate}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                    placeholder="Day of month"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="rental-start-date"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Rental start date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="rental-start-date"
                                    name="rentalStartDate"
                                    type="date"
                                    value={propertyForm.rentalStartDate}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="rental-end-date"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Rental end date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="rental-end-date"
                                    name="rentalEndDate"
                                    type="date"
                                    value={propertyForm.rentalEndDate}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />
                            </div>
                        </div>

                        {formMessage && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-center text-sm font-medium text-red-600">
                                    {formMessage}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            {/* Cancel returns to the homeowner home page */}
                            <button
                                type="button"
                                onClick={() => navigate("/homeowner")}
                                className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:w-auto"
                            >
                                Cancel
                            </button>

                            {/* Save will later send the data to the backend */}
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:w-auto"
                            >
                                {isLoading ? "Saving..." : "Save property"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}