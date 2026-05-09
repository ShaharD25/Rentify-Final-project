/*
Renter issues overview page.
Displays all issues from all apartments linked to the logged-in renter.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRenterProperties } from "../services/propertyService";
import { getPropertyIssues } from "../services/issueService";
import API_BASE_URL from "../services/apiConfig";

export default function RenterIssuesPage() {
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");

    useEffect(() => {
        async function loadRenterIssues() {
            const renterId = sessionStorage.getItem("userId");

            if (!renterId) {
                setPageMessage("No renter session was found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            try {
                const propertiesResult = await getRenterProperties(renterId);

                if (!propertiesResult.success) {
                    setPageMessage(propertiesResult.message || "Failed to load apartments.");
                    setIsLoading(false);
                    return;
                }

                const renterProperties = propertiesResult.properties || [];
                const allIssues = [];

                for (const property of renterProperties) {
                    const issuesResult = await getPropertyIssues(property._id);

                    if (issuesResult.success) {
                        const propertyIssues = (issuesResult.issues || []).map((issue) => ({
                            ...issue,
                            apartmentAddress: property.fullAddress,
                            apartmentId: property._id
                        }));

                        allIssues.push(...propertyIssues);
                    }
                }

                allIssues.sort((firstIssue, secondIssue) => {
                    return new Date(secondIssue.createdAt) - new Date(firstIssue.createdAt);
                });

                setIssues(allIssues);
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadRenterIssues();
    }, []);

    function formatStatus(status) {
        if (status === "in_progress") {
            return "In Progress";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function getStatusBadgeClass(status) {
        if (status === "closed") {
            return "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700";
        }

        if (status === "in_progress") {
            return "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700";
        }

        return "rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700";
    }

    function getImageUrl(imageUrl) {
        if (!imageUrl) {
            return "";
        }

        const serverBaseUrl = API_BASE_URL.replace("/api", "");
        return `${serverBaseUrl}${imageUrl}`;
    }

    const filteredIssues =
        statusFilter === "all"
            ? issues
            : issues.filter((issue) => issue.status === statusFilter);

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                        Rentify
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Issues
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        View all issues from apartments linked to your Renter account
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/renter")}
                    className="rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                >
                    Back to Apartments
                </button>
            </header>

            <section className="mb-5 rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Filter by status
                </label>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100 sm:w-64"
                >
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                </select>
            </section>

            {isLoading ? (
                <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-600">
                        Loading issues...
                    </p>
                </div>
            ) : pageMessage ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                    <p className="text-sm font-medium text-red-600">
                        {pageMessage}
                    </p>
                </div>
            ) : filteredIssues.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">
                        No issues found
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        Open an apartment card and use Add Issue to report a new issue.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                        <article
                            key={issue._id}
                            className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {issue.title}
                                        </h3>

                                        <span className={getStatusBadgeClass(issue.status)}>
                                            {formatStatus(issue.status)}
                                        </span>

                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                                            {issue.category}
                                        </span>

                                        <span
                                            className={
                                                issue.priority === "high"
                                                    ? "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                                                    : issue.priority === "medium"
                                                        ? "rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700"
                                                        : "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                                            }
                                        >
                                            {issue.priority
                                                ? `${issue.priority.charAt(0).toUpperCase()}${issue.priority.slice(1)} Priority`
                                                : "Medium Priority"}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm font-medium text-gray-600">
                                        {issue.apartmentAddress}
                                    </p>

                                    {issue.description && (
                                        <p className="mt-2 text-sm leading-6 text-gray-700">
                                            {issue.description}
                                        </p>
                                    )}

                                    {issue.aiSummary && (
                                        <div className="mt-3 rounded-2xl border border-orange-200 bg-white px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#FF8A00]">
                                                Smart Analysis
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-gray-700">
                                                {issue.aiSummary}
                                            </p>
                                        </div>
                                    )}

                                    <p className="mt-3 text-xs text-gray-500">
                                        Created at: {new Date(issue.createdAt).toLocaleString()}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/renter/apartments/${issue.apartmentId}/issues`)}
                                        className="mt-4 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-orange-50"
                                    >
                                        Open apartment issues
                                    </button>
                                </div>

                                {issue.imageUrl && (
                                    <img
                                        src={getImageUrl(issue.imageUrl)}
                                        alt="Issue"
                                        className="h-28 w-28 rounded-2xl border border-orange-100 object-cover"
                                    />
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}