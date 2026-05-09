/*
Homeowner home page.
Displays the main dashboard summary for homeowners.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import houseHomepageImage from "../images/house-homepage.png";
import { getHomeownerProperties } from "../services/propertyService";
import { getHomeownerIssues } from "../services/issueService";

export default function HomeownerHome() {
    const [firstName, setFirstName] = useState("");
    const [properties, setProperties] = useState([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(true);
    const [propertiesMessage, setPropertiesMessage] = useState("");
    const [openIssuesCount, setOpenIssuesCount] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const savedFirstName = sessionStorage.getItem("firstName") || "";
        setFirstName(savedFirstName);
    }, []);

    useEffect(() => {
        async function loadDashboardData() {
            const homeownerId = sessionStorage.getItem("userId");

            if (!homeownerId) {
                setPropertiesMessage("No homeowner session was found. Please sign in again.");
                setIsLoadingProperties(false);
                return;
            }

            try {
                const propertiesResult = await getHomeownerProperties(homeownerId);

                if (propertiesResult.success) {
                    setProperties(propertiesResult.properties || []);
                } else {
                    setPropertiesMessage(propertiesResult.message || "Failed to load properties.");
                }

                const issuesResult = await getHomeownerIssues(homeownerId);

                if (issuesResult.success) {
                    const activeIssues = (issuesResult.issues || []).filter(
                        (issue) => issue.status !== "closed"
                    );

                    setOpenIssuesCount(activeIssues.length);
                }
            } catch (error) {
                setPropertiesMessage("Server error. Please try again later.");
            } finally {
                setIsLoadingProperties(false);
            }
        }

        loadDashboardData();
    }, []);

    function formatName(name) {
        if (!name) {
            return "";
        }

        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    function getRenterDisplayName(renterItem) {
        // Supports both simple renter objects and renter wrapper objects.
        const renterUser = renterItem?.renter || renterItem;

        if (!renterUser) {
            return "Unknown renter";
        }

        const fullName = `${renterUser.firstName || ""} ${renterUser.lastName || ""}`.trim();

        return fullName || renterUser.email || "Unknown renter";
    }

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

    const visibleProperties = properties.slice(0, 3);
    const hasMoreProperties = properties.length > visibleProperties.length;

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Welcome back{firstName ? `, ${formatName(firstName)}` : ""}!
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage your properties in one place
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

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Total properties
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        {properties.length}
                    </h3>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Open issues
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        {openIssuesCount}
                    </h3>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Pending payments
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        0
                    </h3>
                </div>
            </section>

            <section className="mt-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Recent properties
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Quick access to your latest registered properties
                        </p>
                    </div>

                    {properties.length > 0 && (
                        <button
                            type="button"
                            onClick={() => navigate("/homeowner/properties")}
                            className="rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                        >
                            See all properties
                        </button>
                    )}
                </div>

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
                            Start by adding your first property to manage contracts,
                            payments, tenants, and maintenance requests.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/homeowner/properties/new")}
                            className="mt-6 rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                        >
                            Add your first property
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {visibleProperties.map((property) => (
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

                        {hasMoreProperties && (
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/homeowner/properties")}
                                    className="rounded-2xl border border-orange-200 bg-[#FFF8F3] px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                                >
                                    View {properties.length - visibleProperties.length} more properties
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}