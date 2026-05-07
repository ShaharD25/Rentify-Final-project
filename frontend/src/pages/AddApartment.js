/*
Add apartment page.
Allows a renter to link an existing property using a homeowner join code.
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinPropertyByCode } from "../services/propertyService";

export default function AddApartment() {
    const navigate = useNavigate();

    const [renterJoinCode, setRenterJoinCode] = useState("");
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setPageMessage("");

        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        if (!renterJoinCode.trim()) {
            setPageMessage("Join code is required.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await joinPropertyByCode({
                renterId,
                renterJoinCode
            });

            if (result.success) {
                navigate("/renter");
            } else {
                setPageMessage(result.message || "Failed to add apartment.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FFE8D6] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Add Apartment
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            Enter the join code you received from the homeowner
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/renter")}
                        className="rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                    >
                        Back
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm"
                >
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Apartment join code
                    </label>

                    <input
                        type="text"
                        value={renterJoinCode}
                        onChange={(event) => setRenterJoinCode(event.target.value)}
                        placeholder="Example: A1B2C3D4"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm uppercase tracking-wide text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    />

                    {pageMessage && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-600">
                                {pageMessage}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? "Adding..." : "Add Apartment"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/renter")}
                            className="rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}