/*
Renter home page.
Displays all apartments linked to the logged-in renter.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRenterProperties } from "../services/propertyService";

export default function RenterHome() {
    const navigate = useNavigate();

    const [apartments, setApartments] = useState([]);
    const [isLoadingApartments, setIsLoadingApartments] = useState(true);
    const [pageMessage, setPageMessage] = useState("");

    useEffect(() => {
        async function loadRenterApartments() {
            const renterId = sessionStorage.getItem("userId");

            if (!renterId) {
                setPageMessage("No renter session was found. Please sign in again.");
                setIsLoadingApartments(false);
                return;
            }

            try {
                const result = await getRenterProperties(renterId);

                if (result.success) {
                    setApartments(result.properties || []);
                } else {
                    setPageMessage(result.message || "Failed to load apartments.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoadingApartments(false);
            }
        }

        loadRenterApartments();
    }, []);

    return (
        <div className="min-h-screen bg-[#FFE8D6] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-6xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            My Apartments
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            View all apartments linked to your renter account
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/renter/apartments/add")}
                        className="rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                    >
                        Add Apartment
                    </button>
                </header>

                {isLoadingApartments ? (
                    <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                            Loading apartments...
                        </p>
                    </div>
                ) : pageMessage ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-red-600">
                            {pageMessage}
                        </p>
                    </div>
                ) : apartments.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900">
                            No apartments yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                            Add your first apartment using the join code you received from the homeowner.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/renter/apartments/add")}
                            className="mt-6 rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                        >
                            Add Apartment
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {apartments.map((apartment) => (
                            <button
                                key={apartment._id}
                                type="button"
                                onClick={() => navigate(`/renter/apartments/${apartment._id}`)}
                                className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-900">
                                    {apartment.fullAddress}
                                </h3>

                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    <p>
                                        <span className="font-medium text-gray-800">
                                            Monthly rent:
                                        </span>{" "}
                                        ₪{apartment.monthlyRent}
                                    </p>

                                    <p>
                                        <span className="font-medium text-gray-800">
                                            Billing date:
                                        </span>{" "}
                                        {apartment.billingDate}
                                    </p>

                                    {apartment.homeowner && (
                                        <p>
                                            <span className="font-medium text-gray-800">
                                                Homeowner:
                                            </span>{" "}
                                            {apartment.homeowner.firstName} {apartment.homeowner.lastName}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}