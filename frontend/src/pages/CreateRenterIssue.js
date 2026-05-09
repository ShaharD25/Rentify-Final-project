/*
Create renter issue page.
Allows a renter to report a new issue for the selected apartment.
*/

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createIssueWithImage } from "../services/issueService";

const ISSUE_TITLE_OPTIONS = [
    { value: "Water leak", label: "Water leak" },
    { value: "No electricity", label: "No electricity" },
    { value: "Broken light", label: "Broken light" },
    { value: "Blocked drain", label: "Blocked drain" },
    { value: "Door / lock issue", label: "Door / lock issue" },
    { value: "Heating / cooling issue", label: "Heating / cooling issue" },
    { value: "Appliance issue", label: "Appliance issue" },
    { value: "Noise issue", label: "Noise issue" },
    { value: "Other", label: "Other" }
];

export default function CreateRenterIssue() {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [customTitle, setCustomTitle] = useState("");
    const [description, setDescription] = useState("");
    const [issueImage, setIssueImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [pageMessage, setPageMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function handleTitleChange(event) {
        const selectedTitle = event.target.value;

        setTitle(selectedTitle);

        if (selectedTitle !== "Other") {
            setCustomTitle("");
        }
    }

    function handleImageChange(event) {
        const file = event.target.files?.[0];
        setPageMessage("");

        if (!file) {
            setIssueImage(null);
            setImagePreviewUrl("");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setIssueImage(null);
            setImagePreviewUrl("");
            setPageMessage("Only JPG, PNG, and WEBP images are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setIssueImage(null);
            setImagePreviewUrl("");
            setPageMessage("Image size must be up to 5MB.");
            return;
        }

        setIssueImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setPageMessage("");

        const finalTitle = title === "Other" ? customTitle.trim() : title.trim();

        if (!finalTitle) {
            setPageMessage("Issue title is required.");
            return;
        }
        const renterId = sessionStorage.getItem("userId");
        const firstName = sessionStorage.getItem("firstName") || "Renter";

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        setIsSaving(true);

        try {
            const result = await createIssueWithImage({
                propertyId,
                title: finalTitle,
                description,
                createdByRenter: renterId,
                createdByRenterName: firstName,
                issueImage
            });

            if (result.success) {
                navigate(`/renter/apartments/${propertyId}/issues`);
            } else {
                setPageMessage(result.message || "Failed to create issue.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-3xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                            Rentify
                        </p>

                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Add Issue
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            Report a new apartment issue with an optional description and image.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(`/renter/apartments/${propertyId}/issues`)}
                        className="rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                    >
                        Back
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Issue type
                        </label>

                        <select
                            value={title}
                            onChange={handleTitleChange}
                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                        >
                            <option value="">Select issue type</option>

                            {ISSUE_TITLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {title === "Other" && (
                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Custom issue title
                                </label>

                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={(event) => setCustomTitle(event.target.value)}
                                    placeholder="Enter a short issue title"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Optional: describe the issue"
                            rows={5}
                            className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                        />
                    </div>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Optional image
                        </label>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            onChange={handleImageChange}
                            className="block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
                        />

                        {imagePreviewUrl && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    Image preview
                                </p>

                                <img
                                    src={imagePreviewUrl}
                                    alt="Issue preview"
                                    className="h-40 w-40 rounded-2xl border border-orange-100 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {pageMessage && (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-600">
                                {pageMessage}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? "Saving..." : "Create Issue"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`/renter/apartments/${propertyId}/issues`)}
                            className="rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}