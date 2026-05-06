/*
Property details page.
Displays the main property information, renters section,
and contract section for one selected property.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById, addRenterToProperty, removeRenterFromProperty, uploadContractToProperty } from "../services/propertyService";
import API_BASE_URL from "../services/apiConfig";

export default function PropertyDetails() {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");
    const [isAddingRenter, setIsAddingRenter] = useState(false);
    const [newRenterName, setNewRenterName] = useState("");
    const [renterMessage, setRenterMessage] = useState("");
    const [isSavingRenter, setIsSavingRenter] = useState(false);
    const [selectedContractFile, setSelectedContractFile] = useState(null);
    const [contractMessage, setContractMessage] = useState("");
    const [isUploadingContract, setIsUploadingContract] = useState(false);
    const [isViewingContract, setIsViewingContract] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    async function loadPropertyDetails() {
        if (!propertyId) {
            setPageMessage("Property id is missing.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await getPropertyById(propertyId);

            if (result.success) {
                setProperty(result.property);
            } else {
                setPageMessage(result.message || "Failed to load property details.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadPropertyDetails();
    }, [propertyId]);

    useEffect(() => {
        function handleResize() {
            setIsMobileView(window.innerWidth < 768);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function handleAddRenter() {
        setRenterMessage("");

        if (!newRenterName.trim()) {
            setRenterMessage("Renter name is required.");
            return;
        }

        setIsSavingRenter(true);

        try {
            const result = await addRenterToProperty(propertyId, newRenterName);

            if (result.success) {
                console.log("Updated property from add renter:", result.property);
                setProperty(result.property);
                setNewRenterName("");
                setIsAddingRenter(false);
                setRenterMessage("");
            } else {
                setRenterMessage(result.message || "Failed to add renter.");
            }
        } catch (error) {
            setRenterMessage("Server error. Please try again later.");
        } finally {
            setIsSavingRenter(false);
        }
    }

    async function handleRemoveRenter(renterIndex) {
        try {
            const result = await removeRenterFromProperty(propertyId, renterIndex);

            if (result.success) {
                setProperty(result.property);
            } else {
                setRenterMessage(result.message || "Failed to remove renter.");
            }
        } catch (error) {
            setRenterMessage("Server error. Please try again later.");
        }
    }

    function handleContractFileChange(event) {
        const file = event.target.files?.[0];
        setContractMessage("");

        if (!file) {
            return;
        }

        const isPdfMime = file.type === "application/pdf";
        const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

        if (!isPdfMime || !isPdfExt) {
            setSelectedContractFile(null);
            setContractMessage("Only PDF files are allowed.");
            return;
        }

        setSelectedContractFile(file);
    }

    async function handleUploadContract() {
        setContractMessage("");

        if (!selectedContractFile) {
            setContractMessage("Please choose a PDF file first.");
            return;
        }

        setIsUploadingContract(true);

        try {
            const uploadedBy = sessionStorage.getItem("firstName") || "Unknown";

            const result = await uploadContractToProperty(
                propertyId,
                selectedContractFile,
                uploadedBy
            );

            if (result.success) {
                setProperty(result.property);
                setSelectedContractFile(null);
                setContractMessage("");
            } else {
                setContractMessage(result.message || "Failed to upload contract.");
            }
        } catch (error) {
            setContractMessage("Server error. Please try again later.");
        } finally {
            setIsUploadingContract(false);
        }
    }

    const contractViewUrl = `${API_BASE_URL}/properties/${propertyId}/contract/view`;


    return (
        <div className="min-h-screen bg-[#FFE8D6] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Property details
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            View and manage the full property information
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate(`/homeowner/properties/${propertyId}/issues`)}
                            className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:w-auto"
                        >
                            View Issues
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/homeowner")}
                            className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:w-auto"
                        >
                            Back
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-gray-600">
                            Loading property details...
                        </p>
                    </div>
                ) : pageMessage ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-red-600">{pageMessage}</p>
                    </div>
                ) : property ? (
                    <div className="space-y-6">
                        {/* Main property information */}
                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {property.fullAddress}
                            </h2>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Monthly rent
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        ₪{property.monthlyRent}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Billing date
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {property.billingDate}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Rental start date
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {new Date(property.rentalStartDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Rental end date
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {new Date(property.rentalEndDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Renters section */}
                            <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                                <div className="flex flex-col gap-4 rounded-2xl border border-orange-300 bg-[#FFE8D1] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Renters
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            View current renters assigned to this property
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingRenter((prev) => !prev);
                                            setRenterMessage("");
                                        }}
                                        className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:w-auto"
                                    >
                                        Add Renter
                                    </button>
                                </div>
                                {isAddingRenter && (
                                    <div className="mt-6 rounded-2xl border border-orange-200 bg-[#FFF8F3] p-4">
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Renter name
                                        </label>

                                        <input
                                            type="text"
                                            value={newRenterName}
                                            onChange={(event) => setNewRenterName(event.target.value)}
                                            placeholder="Enter renter full name"
                                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                        />

                                        {renterMessage && (
                                            <p className="mt-3 text-sm font-medium text-red-600">
                                                {renterMessage}
                                            </p>
                                        )}

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={handleAddRenter}
                                                disabled={isSavingRenter}
                                                className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:w-auto"
                                            >
                                                {isSavingRenter ? "Saving..." : "Save Renter"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingRenter(false);
                                                    setNewRenterName("");
                                                    setRenterMessage("");
                                                }}
                                                className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:w-auto"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {property.renters && property.renters.length > 0 ? (
                                    <div className="mt-6 space-y-3">
                                        {property.renters.map((renter, index) => (
                                            <div
                                                key={`${renter}-${index}`}
                                                className="flex flex-col gap-4 rounded-2xl border border-[#D9DEE8] bg-[#F5F7FA] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                            >

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {renter}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Active renter
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRenter(index)}
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-100 sm:w-auto"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-2xl border border-dashed border-orange-300 bg-[#FFF7F0] px-5 py-8 text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            No renters assigned yet
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Add renters to keep occupancy information updated
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Contract section */}
                            <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                                <div className="flex flex-col gap-4 rounded-2xl border border-orange-300 bg-[#FFE8D1] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Contract
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Upload, replace, and view the rental contract for this property
                                        </p>
                                    </div>

                                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                        <label className="w-full cursor-pointer rounded-2xl border border-orange-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:w-auto">
                                            Choose PDF
                                            <input
                                                type="file"
                                                accept="application/pdf,.pdf"
                                                onChange={handleContractFileChange}
                                                className="hidden"
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleUploadContract}
                                            disabled={isUploadingContract}
                                            className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                                        >
                                            {property.contractFileName
                                                ? isUploadingContract
                                                    ? "Replacing..."
                                                    : "Replace Contract"
                                                : isUploadingContract
                                                    ? "Uploading..."
                                                    : "Upload Contract"}
                                        </button>
                                    </div>
                                </div>

                                {selectedContractFile && (
                                    <div className="mt-6 rounded-2xl border border-orange-200 bg-white px-5 py-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Selected file
                                        </p>
                                        <p className="mt-2 font-semibold text-gray-900">
                                            {selectedContractFile.name}
                                        </p>
                                    </div>
                                )}

                                {contractMessage && (
                                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                                        <p className="text-sm font-medium text-red-600">
                                            {contractMessage}
                                        </p>
                                    </div>
                                )}

                                {property.contractFileName ? (
                                    <div className="mt-6 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                            <p className="text-sm font-medium text-gray-500">
                                                Current contract file
                                            </p>
                                            <p className="mt-2 font-semibold text-gray-900">
                                                {property.contractFileName}
                                            </p>

                                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium text-gray-800">Uploaded by:</span>{" "}
                                                    {property.contractUploadedBy || "Unknown"}
                                                </p>
                                                <p>
                                                    <span className="font-medium text-gray-800">Upload date:</span>{" "}
                                                    {property.contractUploadedAt
                                                        ? new Date(property.contractUploadedAt).toLocaleString()
                                                        : "Not available"}
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsViewingContract((prev) => !prev)}
                                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-slate-100"
                                                >
                                                    {isViewingContract ? "Hide Contract" : "View Contract"}
                                                </button>
                                            </div>
                                        </div>

                                        {isViewingContract && (
                                            <div className="mt-4 flex justify-center">
                                                <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                                    <iframe
                                                        src={`${contractViewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                                        title="Property contract"
                                                        className="h-[700px] w-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-2xl border border-dashed border-orange-300 bg-[#FFF7F0] px-5 py-8 text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            No contract uploaded yet
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Upload the signed contract to keep all property documents in one place
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}