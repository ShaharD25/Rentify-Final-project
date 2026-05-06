/*
Issues page.
Displays either all homeowner issues or issues for one selected property.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHomeownerIssues, getPropertyIssues } from "../services/issueService";

export default function IssuesPage() {
    const navigate = useNavigate();
    const { propertyId } = useParams();

    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState("");

    useEffect(() => {
        async function loadIssues() {
            setIsLoading(true);
            setPageMessage("");

            try {
                if (propertyId) {
                    const result = await getPropertyIssues(propertyId);

                    if (result.success) {
                        setIssues(result.issues || []);
                    } else {
                        setPageMessage(result.message || "Failed to load issues.");
                    }
                } else {
                    const homeownerId = sessionStorage.getItem("userId");

                    if (!homeownerId) {
                        setPageMessage("No homeowner session was found. Please sign in again.");
                        setIsLoading(false);
                        return;
                    }

                    const result = await getHomeownerIssues(homeownerId);

                    if (result.success) {
                        setIssues(result.issues || []);
                    } else {
                        setPageMessage(result.message || "Failed to load issues.");
                    }
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadIssues();
    }, [propertyId]);

    function formatStatus(status) {
        if (status === "in_progress") {
            return "In Progress";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    return (
        <div className="min-h-screen bg-[#FFE8D6] px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Issues
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {propertyId
                                ? "View all issues linked to this property"
                                : "View all maintenance issues across your properties"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(propertyId ? `/homeowner/properties/${propertyId}` : "/homeowner")}
                        className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50 sm:w-auto"
                    >
                        Back
                    </button>
                </div>

                {isLoading ? (
                    <div className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Loading issues...</p>
                    </div>
                ) : pageMessage ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-medium text-red-600">{pageMessage}</p>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900">No issues yet</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                            No maintenance issues were found for this view.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {issues.map((issue) => (
                            <button
                                key={issue._id}
                                type="button"
                                onClick={() => navigate(`/homeowner/issues/${issue._id}`)}
                                className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {issue.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
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

                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    {issue.property?.fullAddress && (
                                        <p>
                                            <span className="font-medium text-gray-800">Property:</span>{" "}
                                            {issue.property.fullAddress}
                                        </p>
                                    )}

                                    <p>
                                        <span className="font-medium text-gray-800">Created:</span>{" "}
                                        {new Date(issue.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                {issue.imageUrl ? (
                                    <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100 bg-white">
                                        <img
                                            src={issue.imageUrl}
                                            alt={issue.title}
                                            className="h-48 w-full object-cover"
                                        />
                                    </div>
                                ) : null}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}