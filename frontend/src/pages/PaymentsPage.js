/*
Payments page.
Allows a homeowner to track monthly rent payments, update statuses,
view renter history, and see basic income analytics.
*/

import { useEffect, useState } from "react";
import {
    generateMonthlyPayments,
    getHomeownerPayments,
    updatePaymentStatus,
    getRenterPaymentHistory,
    getIncomeAnalytics
} from "../services/paymentService";

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
    const [selectedRenterName, setSelectedRenterName] = useState("");
    const [renterHistory, setRenterHistory] = useState([]);
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    async function loadPaymentsData() {
        const homeownerId = sessionStorage.getItem("userId");

        if (!homeownerId) {
            setPageMessage("No homeowner session was found. Please sign in again.");
            setIsLoading(false);
            return;
        }

        try {
            const paymentsResult = await getHomeownerPayments(homeownerId);

            if (paymentsResult.success) {
                setPayments(paymentsResult.payments || []);
            } else {
                setPageMessage(paymentsResult.message || "Failed to load payments.");
            }

            const analyticsResult = await getIncomeAnalytics(homeownerId);

            if (analyticsResult.success) {
                setAnalytics(analyticsResult.analytics || []);
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadPaymentsData();
    }, []);

    async function handleGeneratePayments() {
        const homeownerId = sessionStorage.getItem("userId");

        if (!homeownerId) {
            setPageMessage("No homeowner session was found. Please sign in again.");
            return;
        }

        setPageMessage("");
        setIsGenerating(true);

        try {
            const result = await generateMonthlyPayments({
                homeownerId,
                month: currentMonth,
                year: currentYear
            });

            if (result.success) {
                setPageMessage("Monthly payments generated successfully.");
                await loadPaymentsData();
            } else {
                setPageMessage(result.message || "Failed to generate payments.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleStatusUpdate(paymentId, status) {
        setPageMessage("");

        try {
            const result = await updatePaymentStatus(paymentId, status);

            if (result.success) {
                await loadPaymentsData();
            } else {
                setPageMessage(result.message || "Failed to update payment status.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        }
    }

    async function handleLoadRenterHistory(renterName) {
        const homeownerId = sessionStorage.getItem("userId");

        if (!homeownerId) {
            setPageMessage("No homeowner session was found. Please sign in again.");
            return;
        }

        setSelectedRenterName(renterName);

        try {
            const result = await getRenterPaymentHistory(homeownerId, renterName);

            if (result.success) {
                setRenterHistory(result.payments || []);
            } else {
                setPageMessage(result.message || "Failed to load renter history.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        }
    }

    function formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function formatMonth(month, year) {
        return `${String(month).padStart(2, "0")}/${year}`;
    }

    function getStatusBadgeClass(status) {
        if (status === "paid") {
            return "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700";
        }

        if (status === "late") {
            return "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700";
        }

        return "rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700";
    }

    const filteredPayments =
        selectedStatusFilter === "all"
            ? payments
            : payments.filter((payment) => payment.status === selectedStatusFilter);

    const totalPaidIncome = payments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0);

    const unpaidCount = payments.filter((payment) => payment.status === "unpaid").length;
    const lateCount = payments.filter((payment) => payment.status === "late").length;

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                        Rentify
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Payments
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Track rent payment statuses, renter history, and monthly income.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleGeneratePayments}
                    disabled={isGenerating}
                    className="rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isGenerating
                        ? "Generating..."
                        : `Generate ${formatMonth(currentMonth, currentYear)} Payments`}
                </button>
            </header>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Paid income
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        ₪{totalPaidIncome}
                    </h3>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Unpaid payments
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        {unpaidCount}
                    </h3>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Late payments
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-gray-900">
                        {lateCount}
                    </h3>
                </div>
            </section>

            {pageMessage && (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">
                        {pageMessage}
                    </p>
                </div>
            )}

            <section className="mt-6 rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Payment records
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            View and update rent payment status per property and renter.
                        </p>
                    </div>

                    <select
                        value={selectedStatusFilter}
                        onChange={(event) => setSelectedStatusFilter(event.target.value)}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    >
                        <option value="all">All statuses</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="late">Late</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="mt-6 rounded-2xl border border-orange-100 bg-white px-6 py-10 text-center">
                        <p className="text-sm font-medium text-gray-600">
                            Loading payments...
                        </p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white px-6 py-10 text-center">
                        <h3 className="text-lg font-bold text-gray-900">
                            No payments found
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Generate monthly payments to start tracking renter payments.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-orange-100">
                        <div className="grid grid-cols-1 divide-y divide-orange-100 bg-white">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment._id}
                                    className="p-5"
                                >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {payment.property?.fullAddress || "Property not available"}
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-600">
                                                Renter:{" "}
                                                <span className="font-semibold text-gray-900">
                                                    {payment.renterName}
                                                </span>
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Month: {formatMonth(payment.month, payment.year)}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Amount: ₪{payment.amount}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                Due date: {new Date(payment.dueDate).toLocaleDateString()}
                                            </p>

                                            {payment.riskFlag && (
                                                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                                                    <p className="text-sm font-semibold text-red-700">
                                                        Risk warning
                                                    </p>
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {payment.riskReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3 xl:items-end">
                                            <span className={getStatusBadgeClass(payment.status)}>
                                                {formatStatus(payment.status)}
                                            </span>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusUpdate(payment._id, "paid")}
                                                    className="rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                                >
                                                    Mark Paid
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusUpdate(payment._id, "late")}
                                                    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                                >
                                                    Mark Late
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusUpdate(payment._id, "unpaid")}
                                                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    Mark Unpaid
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleLoadRenterHistory(payment.renterName)}
                                                    className="rounded-xl border border-orange-200 bg-[#FFF8F3] px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-orange-50"
                                                >
                                                    View History
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900">
                        Renter payment history
                    </h2>

                    {selectedRenterName ? (
                        <>
                            <p className="mt-2 text-sm text-gray-600">
                                Showing history for{" "}
                                <span className="font-semibold text-gray-900">
                                    {selectedRenterName}
                                </span>
                            </p>

                            <div className="mt-5 space-y-3">
                                {renterHistory.length === 0 ? (
                                    <p className="text-sm text-gray-600">
                                        No history found for this renter.
                                    </p>
                                ) : (
                                    renterHistory.map((payment) => (
                                        <div
                                            key={payment._id}
                                            className="rounded-2xl border border-orange-100 bg-white p-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatMonth(payment.month, payment.year)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {payment.property?.fullAddress}
                                                    </p>
                                                </div>

                                                <span className={getStatusBadgeClass(payment.status)}>
                                                    {formatStatus(payment.status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="mt-2 text-sm text-gray-600">
                            Click View History on a payment record to see renter payment behavior.
                        </p>
                    )}
                </div>

                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900">
                        Monthly income summary
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Paid rent totals grouped by month.
                    </p>

                    <div className="mt-5 space-y-3">
                        {analytics.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                No paid income data yet.
                            </p>
                        ) : (
                            analytics.map((item) => (
                                <div
                                    key={item.month}
                                    className="rounded-2xl border border-orange-100 bg-white p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {item.month}
                                        </p>

                                        <p className="text-sm font-bold text-gray-900">
                                            ₪{item.totalIncome}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}