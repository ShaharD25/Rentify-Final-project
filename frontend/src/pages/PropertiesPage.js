/*
Properties page.
Displays the full list of properties that belong to the logged-in homeowner.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import houseHomepageImage from "../images/house-homepage.png";
import { getHomeownerProperties } from "../services/propertyService";

export default function PropertiesPage() {
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(true);
    const [propertiesMessage, setPropertiesMessage] = useState("");
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        async function loadProperties() {
            const homeownerId = sessionStorage.getItem("userId");

            if (!homeownerId) {
                setPropertiesMessage("No homeowner session was found. Please sign in again.");
                setIsLoadingProperties(false);
                return;
            }

            try {
                const result = await getHomeownerProperties(homeownerId);

                if (result.success) {
                    setProperties(result.properties || []);
                } else {
                    setPropertiesMessage(result.message || "Failed to load properties.");
                }
            } catch (error) {
                setPropertiesMessage("Server error. Please try again later.");
            } finally {
                setIsLoadingProperties(false);
            }
        }

        loadProperties();
    }, []);

    function getRenterDisplayName(renterItem) {
        // Supports both simple renter objects and renter wrapper objects.
        const renterUser = renterItem?.renter || renterItem;

        if (!renterUser) {
            return "Unknown renter";
        }

        const fullName = `${renterUser.firstName || ""} ${renterUser.lastName || ""}`.trim();

        return fullName || renterUser.email || "Unknown renter";
    }


    const filteredProperties = properties.filter((property) => {
        const address = property.fullAddress || "";

        const renters = property.renters
            ? property.renters
                .map((renterItem) => getRenterDisplayName(renterItem))
                .join(" ")
            : "";

        const searchableText = `${address} ${renters}`.toLowerCase();

        return searchableText.includes(searchText.toLowerCase());
    });

    
    function formatRenters(renters) {
        if (!renters || renters.length === 0) {
            return "No renters assigned yet";
        }

        const renterNames = renters.map((renterItem) => getRenterDisplayName(renterItem));

        if (renterNames.length === 1) {
            return renterNames[0];
        }

        return `${renterNames.slice(0, -1).join(", ")} and ${renterNames[renterNames.length - 1]}`;
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                        Rentify
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Properties
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        View and manage all properties connected to your account
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/homeowner/properties/new")}
                    className="rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                >
                    Add Property
                </button>
            </header>

            <section className="mb-5 rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Search properties
                </label>

                <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search by address or renter name"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                />
            </section>

            {isLoadingProperties ? (
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-600">
                        Loading properties...
                    </p>
                </div>
            ) : propertiesMessage ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-600">
                        {propertiesMessage}
                    </p>
                </div>
            ) : properties.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center">
                        <img
                            src={houseHomepageImage}
                            alt="Property"
                            className="h-20 w-20 object-contain"
                        />
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-gray-900">
                        No properties yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                        Start by adding your first property to manage renters,
                        contracts, payments, and maintenance issues.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/homeowner/properties/new")}
                        className="mt-6 rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                    >
                        Add your first property
                    </button>
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">
                        No matching properties
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        Try searching with a different address or renter name.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProperties.map((property) => (
                        <button
                            key={property._id}
                            type="button"
                            onClick={() => navigate(`/homeowner/properties/${property._id}`)}
                            className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <h3 className="text-lg font-bold text-gray-900">
                                {property.fullAddress}
                            </h3>

                            <p className="mt-2 text-sm font-medium text-gray-500">
                                {formatRenters(property.renters)}
                            </p>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <p>
                                    <span className="font-medium text-gray-800">
                                        Monthly rent:
                                    </span>{" "}
                                    ₪{property.monthlyRent}
                                </p>

                                <p>
                                    <span className="font-medium text-gray-800">
                                        Billing date:
                                    </span>{" "}
                                    {property.billingDate}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}