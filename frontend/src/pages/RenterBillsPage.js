/*
Renter bills entry page.
If the renter has one apartment, it redirects directly to its bills page.
If the renter has more than one apartment, it lets the renter choose.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRenterProperties } from "../services/propertyService";

export default function RenterBillsPage() {
    const navigate = useNavigate();

    const [apartments, setApartments] = useState([]);
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadApartments() {
            const renterId = sessionStorage.getItem("userId");

            if (!renterId) {
                setPageMessage("No renter session was found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getRenterProperties(renterId);

                if (result.success) {
                    const renterApartments = result.properties || [];

                    if (renterApartments.length === 1) {
                        navigate(`/renter/apartments/${renterApartments[0]._id}/bills`);
                        return;
                    }

                    setApartments(renterApartments);
                } else {
                    setPageMessage(result.message || "Failed to load apartments.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadApartments();
    }, [navigate]);

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6">
                <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                    Rentify
                </p>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Bills
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    Choose an apartment to view and manage shared bills.
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
                        Loading apartments...
                    </p>
                </div>
            ) : apartments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">
                        No apartments found
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        Bills will be available after an apartment is linked to your account.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {apartments.map((apartment) => (
                        <button
                            key={apartment._id}
                            type="button"
                            onClick={() => navigate(`/renter/apartments/${apartment._id}/bills`)}
                            className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <h3 className="text-lg font-bold text-gray-900">
                                {apartment.fullAddress}
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Open apartment bills
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}