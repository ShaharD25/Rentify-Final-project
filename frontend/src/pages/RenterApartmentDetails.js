/*
Renter apartment details page.
Displays the main apartment information for the logged-in renter.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById } from "../services/propertyService";
import API_BASE_URL from "../services/apiConfig";

export default function RenterApartmentDetails() {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [apartment, setApartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");
    const [isViewingContract, setIsViewingContract] = useState(false);

    useEffect(() => {
        async function loadApartmentDetails() {
            if (!propertyId) {
                setPageMessage("Apartment id is missing.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getPropertyById(propertyId);

                if (result.success) {
                    setApartment(result.property);
                } else {
                    setPageMessage(result.message || "Failed to load apartment details.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadApartmentDetails();
    }, [propertyId]);

    const contractViewUrl = `${API_BASE_URL}/properties/${propertyId}/contract/view`;

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Apartment Details
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            View your apartment information and rental details
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

                {isLoading ? (
                    <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                            Loading apartment details...
                        </p>
                    </div>
                ) : pageMessage ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-red-600">
                            {pageMessage}
                        </p>
                    </div>
                ) : apartment ? (
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {apartment.fullAddress}
                            </h2>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Monthly rent
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        ₪{apartment.monthlyRent}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Payment date
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {apartment.billingDate}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Rental start date
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {new Date(apartment.rentalStartDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Rental end date
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {new Date(apartment.rentalEndDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {apartment.homeowner && (
                                <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Homeowner
                                    </p>
                                    <p className="mt-2 font-semibold text-gray-900">
                                        {apartment.homeowner.firstName} {apartment.homeowner.lastName}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {apartment.homeowner.email}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Contract
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Check whether a contract exists for this apartment
                                    </p>
                                </div>

                                {apartment.contractFileName && (
                                    <button
                                        type="button"
                                        onClick={() => setIsViewingContract((prev) => !prev)}
                                        className="rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                                    >
                                        {isViewingContract ? "Hide Contract" : "View Contract"}
                                    </button>
                                )}
                            </div>

                            {apartment.contractFileName ? (
                                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-green-700">
                                        Contract available
                                    </p>
                                    <p className="mt-1 text-sm text-green-700">
                                        {apartment.contractFileName}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-8 text-center">
                                    <p className="text-sm font-medium text-gray-700">
                                        No contract uploaded yet
                                    </p>
                                </div>
                            )}

                            {isViewingContract && apartment.contractFileName && (
                                <div className="mt-6 flex justify-center">
                                    <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                        <iframe
                                            src={`${contractViewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                            title="Apartment contract"
                                            className="h-[700px] w-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/renter/apartments/${propertyId}/issues`)}
                                className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-900">
                                    Issues
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    View and report apartment issues
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/renter/apartments/${propertyId}/bills`)}
                                className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-900">
                                    Bills
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    Track shared apartment expenses
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/renter/apartments/${propertyId}/roommates`)}
                                className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-900">
                                    Roommates
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    View apartment Renters and invite a roommate
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/renter/apartments/${propertyId}/chat`)}
                                className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-900">
                                    Chat
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    Open the apartment group chat
                                </p>
                            </button>
                        </section>
                    </div>
                ) : null}
            </div>
        </div>
    );
}