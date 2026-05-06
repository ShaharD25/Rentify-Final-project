/*
Homeowner home page.
Displays the main dashboard for homeowners with a responsive sidebar,
top section, summary cards, and an empty state for properties.
*/

import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import houseHomepageImage from "../images/house-homepage.png";
import { getHomeownerProperties } from "../services/propertyService";
import { getHomeownerIssues } from "../services/issueService";

export default function HomeownerHome() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

        loadProperties();
    }, []);

    function formatName(name) {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    // Clear the current session data and return to the auth page.
    function handleLogout() {
        sessionStorage.removeItem("firstName");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("role");
        navigate("/auth");
    }

    return (
        <div className="min-h-screen bg-[#FFE8D6]">
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`fixed left-0 top-0 z-50 flex h-full w-72 transform flex-col bg-[#FFF8F3]/95 backdrop-blur-sm border-r border-orange-100 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex h-20 items-center justify-between border-b border-orange-100 px-6">
                        <div>
                            <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                                Rentify
                            </p>
                            <h2 className="mt-1 text-lg font-bold text-gray-900">
                                Homeowner
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(false)}
                            className="rounded-xl p-2 text-gray-500 hover:bg-orange-50 hover:text-gray-700 lg:hidden"
                        >
                            ✕
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6">
                        <div className="space-y-2">
                            <button className="flex w-full items-center justify-between rounded-2xl bg-[#FF8A00] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm">
                                <span>Dashboard</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Properties</span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/homeowner/issues")}
                                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50"
                            >
                                <span>Issues</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Payments</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Maintenance</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Messages</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Notifications</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Settings</span>
                                <span>›</span>
                            </button>
                        </div>
                    </nav>

                    <div className="px-4 pb-4 mt-auto">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                        >
                            Log out
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Top bar */}
                    <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#FFE8D6]/90 backdrop-blur-sm">
                        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="rounded-2xl border border-orange-100 bg-[#FFF8F3] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm lg:hidden"
                                >
                                    Menu
                                </button>

                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                        Welcome back{firstName ? `, ${formatName(firstName)}` : ""}!
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Manage your properties in one place
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/homeowner/properties/new")}
                                className="hidden rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:block"
                            >
                                Add Property
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                        {/* Mobile Add Property button */}
                        <button
                            type="button"
                            onClick={() => navigate("/homeowner/properties/new")}
                            className="mb-5 w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:hidden"
                        >
                            Add Property
                        </button>

                        {/* Summary cards */}
                        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Total properties
                                </p>
                                <h3 className="mt-3 text-3xl font-bold text-gray-900">{properties.length}</h3>
                            </div>

                            <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Open issues
                                </p>
                                <h3 className="mt-3 text-3xl font-bold text-gray-900">{openIssuesCount}</h3>
                            </div>

                            <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">
                                    Pending payments
                                </p>
                                <h3 className="mt-3 text-3xl font-bold text-gray-900">0</h3>
                            </div>
                        </section>

                        {/* Properties section */}
                        <section className="mt-8">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Your properties
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        View and manage all registered properties
                                    </p>
                                </div>
                            </div>
                            {isLoadingProperties ? (
                                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                                    <p className="text-sm font-medium text-gray-600">Loading properties...</p>
                                </div>
                            ) : propertiesMessage ? (
                                <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                                    <p className="text-sm font-medium text-red-600">{propertiesMessage}</p>
                                </div>
                            ) : properties.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                                    {/* Property illustration placeholder */}
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {properties.map((property) => (
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
                                                {property.renters && property.renters.length > 0
                                                    ? property.renters.length === 1
                                                        ? property.renters[0]
                                                        : `${property.renters.slice(0, -1).join(", ")} and ${property.renters[property.renters.length - 1]}`
                                                    : "No renters assigned yet"}
                                            </p>

                                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium text-gray-800">Monthly rent:</span>{" "}
                                                    ₪{property.monthlyRent}
                                                </p>
                                                <p>
                                                    <span className="font-medium text-gray-800">Billing date:</span>{" "}
                                                    {property.billingDate}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}