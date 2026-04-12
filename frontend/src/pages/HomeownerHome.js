/*
Homeowner home page.
Displays the main dashboard for homeowners with a responsive sidebar,
top section, summary cards, and an empty state for properties.
*/

import { useState } from "react";
import { useEffect } from "react";

export default function HomeownerHome() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [firstName, setFirstName] = useState("");
    const properties = [];

    useEffect(() => {
        const savedFirstName = sessionStorage.getItem("firstName") || "";
        setFirstName(savedFirstName);
    }, []);

    function formatName(name) {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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
                    className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-[#FFF8F3]/95 backdrop-blur-sm border-r border-orange-100 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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

                    <nav className="px-4 py-6">
                        <div className="space-y-2">
                            <button className="flex w-full items-center justify-between rounded-2xl bg-[#FF8A00] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm">
                                <span>Dashboard</span>
                                <span>›</span>
                            </button>

                            <button className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50">
                                <span>Properties</span>
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
                                <h3 className="mt-3 text-3xl font-bold text-gray-900">0</h3>
                            </div>

                            <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                                <p className="text-sm font-medium text-gray-500">Open issues</p>
                                <h3 className="mt-3 text-3xl font-bold text-gray-900">0</h3>
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

                            {properties.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                                        🏠
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
                                        className="mt-6 rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                                    >
                                        Add your first property
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {/* Property cards will be rendered here later */}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}