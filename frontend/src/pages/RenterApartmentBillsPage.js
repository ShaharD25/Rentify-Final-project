/*
Renter apartment bills page.
Allows renters to view shared apartment bills, add new bills,
see monthly summary, and identify unusual bills.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createApartmentBill,
    getApartmentBills
} from "../services/billService";

export default function RenterApartmentBillsPage() {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [bills, setBills] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        amount: "",
        dueDate: "",
        category: "electricity",
        description: ""
    });

    useEffect(() => {
        loadBills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId]);

    async function loadBills() {
        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await getApartmentBills(propertyId, renterId);

            if (result.success) {
                setBills(result.bills || []);
                setMonthlySummary(result.monthlySummary || null);
            } else {
                setPageMessage(result.message || "Failed to load bills.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    async function handleAddBill(event) {
        event.preventDefault();

        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setPageMessage("Bill amount must be greater than zero.");
            return;
        }

        if (!formData.dueDate) {
            setPageMessage("Due date is required.");
            return;
        }

        setIsSaving(true);
        setPageMessage("");

        try {
            const result = await createApartmentBill(propertyId, {
                renterId,
                amount: Number(formData.amount),
                dueDate: formData.dueDate,
                category: formData.category,
                description: formData.description
            });

            if (result.success) {
                setFormData({
                    amount: "",
                    dueDate: "",
                    category: "electricity",
                    description: ""
                });

                await loadBills();
            } else {
                setPageMessage(result.message || "Failed to add bill.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsSaving(false);
        }
    }

    function formatCategory(category) {
        if (category === "municipal_tax") {
            return "Municipal Tax";
        }

        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    function formatMonth(monthData) {
        if (!monthData) {
            return "-";
        }

        return `${String(monthData.month).padStart(2, "0")}/${monthData.year}`;
    }

    function formatAmount(amount) {
        return `₪${Number(amount || 0).toLocaleString()}`;
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                        Rentify
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Apartment Bills
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Track shared apartment expenses and unusual bill amounts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/renter/apartments/${propertyId}`)}
                    className="rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                >
                    Back
                </button>
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
                        Loading bills...
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {monthlySummary && (
                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900">
                                Previous Months Summary
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-orange-100 bg-[#FFFCF8] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Last month ({formatMonth(monthlySummary.lastMonth)})
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-gray-900">
                                        {formatAmount(monthlySummary.lastMonthTotal)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-orange-100 bg-[#FFFCF8] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Month before ({formatMonth(monthlySummary.monthBefore)})
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-gray-900">
                                        {formatAmount(monthlySummary.monthBeforeTotal)}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-orange-100 bg-[#FFFCF8] p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Difference
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-gray-900">
                                        {formatAmount(monthlySummary.difference)}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900">
                            Add Bill
                        </h2>

                        <form onSubmit={handleAddBill} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter bill amount"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Due date
                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                >
                                    <option value="electricity">Electricity</option>
                                    <option value="water">Water</option>
                                    <option value="gas">Gas</option>
                                    <option value="internet">Internet</option>
                                    <option value="municipal_tax">Municipal Tax</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Optional description"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSaving ? "Saving..." : "Add Bill"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900">
                            Bills List
                        </h2>

                        {bills.length === 0 ? (
                            <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-[#FFFCF8] px-6 py-10 text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    No bills yet
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 overflow-hidden rounded-2xl border border-orange-100 bg-[#FFFCF8]">
                                {bills.map((bill) => (
                                    <div
                                        key={bill._id}
                                        className="flex flex-col gap-3 border-b border-orange-100 px-5 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-gray-900">
                                                    {formatCategory(bill.category)}
                                                </h3>

                                                {bill.isUnusual && (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                                        Unusual
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Due date: {new Date(bill.dueDate).toLocaleDateString()}
                                            </p>

                                            {bill.description && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {bill.description}
                                                </p>
                                            )}

                                            {bill.anomalyReason && (
                                                <p className="mt-2 text-sm font-medium text-red-600">
                                                    {bill.anomalyReason}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-left md:text-right">
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatAmount(bill.amount)}
                                            </p>

                                            {bill.createdByRenter && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Added by {bill.createdByRenter.firstName} {bill.createdByRenter.lastName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}