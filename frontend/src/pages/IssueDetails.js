/*
Issue details page.
Displays full issue information, status management,
and a simple message thread.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getIssueById,
    updateIssueStatus,
    addIssueMessage
} from "../services/issueService";

export default function IssueDetails() {
    const navigate = useNavigate();
    const { issueId } = useParams();

    const [issue, setIssue] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("open");
    const [statusMessage, setStatusMessage] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [messageError, setMessageError] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    useEffect(() => {
        async function loadIssueDetails() {
            if (!issueId) {
                setPageMessage("Issue id is missing.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getIssueById(issueId);

                if (result.success) {
                    setIssue(result.issue);
                    setSelectedStatus(result.issue.status);
                } else {
                    setPageMessage(result.message || "Failed to load issue details.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadIssueDetails();
    }, [issueId]);

    async function handleStatusUpdate() {
        setStatusMessage("");

        try {
            const result = await updateIssueStatus(issueId, selectedStatus);

            if (result.success) {
                setIssue(result.issue);
                setStatusMessage("Issue status updated successfully.");
            } else {
                setStatusMessage(result.message || "Failed to update issue status.");
            }
        } catch (error) {
            setStatusMessage("Server error. Please try again later.");
        }
    }

    async function handleSendMessage() {
        setMessageError("");

        if (!newMessage.trim()) {
            setMessageError("Message text is required.");
            return;
        }

        setIsSendingMessage(true);

        try {
            const senderName = sessionStorage.getItem("firstName") || "Homeowner";

            const result = await addIssueMessage(issueId, {
                senderRole: "homeowner",
                senderName,
                text: newMessage
            });

            if (result.success) {
                setIssue(result.issue);
                setNewMessage("");
            } else {
                setMessageError(result.message || "Failed to send message.");
            }
        } catch (error) {
            setMessageError("Server error. Please try again later.");
        } finally {
            setIsSendingMessage(false);
        }
    }

    function formatStatus(status) {
        if (status === "in_progress") {
            return "In Progress";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    const sortedMessages = issue?.messages
        ? [...issue.messages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
        : [];

    return (
        <div className="min-h-screen bg-[#FFE8D6] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-5xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Issue details
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Review the issue, update status, and respond to the renter
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:w-auto"
                    >
                        Back
                    </button>
                </div>

                {isLoading ? (
                    <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Loading issue details...</p>
                    </div>
                ) : pageMessage ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-red-600">{pageMessage}</p>
                    </div>
                ) : issue ? (
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {issue.title}
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-700">
                                        {issue.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-[#F6EBDD] px-3 py-1 text-xs font-semibold text-gray-700">
                                        {formatCategory(issue.category)}
                                    </span>

                                    <span className="rounded-full bg-[#F5F7FA] px-3 py-1 text-xs font-semibold text-gray-700">
                                        {formatStatus(issue.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">Property</p>
                                    <p className="mt-2 text-base font-semibold text-gray-900">
                                        {issue.property?.fullAddress || "Not available"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[#E7D8C8] bg-[#F6EBDD] p-4">
                                    <p className="text-sm font-medium text-gray-500">Created</p>
                                    <p className="mt-2 text-base font-semibold text-gray-900">
                                        {new Date(issue.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {issue.imageUrl ? (
                                <div className="mt-6 overflow-hidden rounded-2xl border border-orange-100 bg-white">
                                    <img
                                        src={issue.imageUrl}
                                        alt={issue.title}
                                        className="max-h-[420px] w-full object-cover"
                                    />
                                </div>
                            ) : null}
                        </section>

                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="w-full sm:max-w-xs">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Issue status
                                    </label>

                                    <select
                                        value={selectedStatus}
                                        onChange={(event) => setSelectedStatus(event.target.value)}
                                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleStatusUpdate}
                                    className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] sm:w-auto"
                                >
                                    Save Status
                                </button>
                            </div>

                            {statusMessage && (
                                <p className="mt-4 text-sm font-medium text-gray-700">
                                    {statusMessage}
                                </p>
                            )}
                        </section>

                        <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                            <h3 className="text-xl font-bold text-gray-900">Messages</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Communicate with the renter about the issue solution
                            </p>

                            <div className="mt-6 space-y-3">
                                {issue.messages && issue.messages.length > 0 ? (
                                    sortedMessages.map((message, index) => (
                                        <div
                                            key={`${message.senderName}-${message.createdAt}-${index}`}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {message.senderName} ({message.senderRole})
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </p>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-gray-700">
                                                {message.text}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-orange-200 bg-white px-5 py-8 text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            No messages yet
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Start the conversation about this issue
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 rounded-2xl border border-orange-200 bg-white p-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Send a response
                                </label>

                                <textarea
                                    value={newMessage}
                                    onChange={(event) => setNewMessage(event.target.value)}
                                    rows={4}
                                    placeholder="Write your message to the renter"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />

                                {messageError && (
                                    <p className="mt-3 text-sm font-medium text-red-600">
                                        {messageError}
                                    </p>
                                )}

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSendMessage}
                                        disabled={isSendingMessage}
                                        className="rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSendingMessage ? "Sending..." : "Send Message"}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : null}
            </div>
        </div>
    );
}