/*
Renter apartment roommates page.
Displays all Renters linked to the apartment and allows joining by code.
*/

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    generateApartmentJoinCode,
    getApartmentRoommates,
    joinApartmentByCode
} from "../services/roommateService";

export default function RenterApartmentRoommatesPage() {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [roommates, setRoommates] = useState([]);
    const [renterJoinCode, setRenterJoinCode] = useState("");
    const [joinCodeInput, setJoinCodeInput] = useState("");
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        loadRoommates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId]);

    async function loadRoommates() {
        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await getApartmentRoommates(propertyId, renterId);

            if (result.success) {
                setProperty(result.property);
                setRoommates(result.roommates || []);
                setRenterJoinCode(result.property?.renterJoinCode || "");
            } else {
                setPageMessage(result.message || "Failed to load roommates.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleGenerateJoinCode() {
        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        setIsGeneratingCode(true);
        setPageMessage("");

        try {
            const result = await generateApartmentJoinCode(propertyId, renterId);

            if (result.success) {
                setRenterJoinCode(result.renterJoinCode);
                setPageMessage("Join code generated successfully.");
            } else {
                setPageMessage(result.message || "Failed to generate join code.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsGeneratingCode(false);
        }
    }

    async function handleJoinByCode(event) {
        event.preventDefault();

        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        if (!joinCodeInput.trim()) {
            setPageMessage("Join code is required.");
            return;
        }

        setIsJoining(true);
        setPageMessage("");

        try {
            const result = await joinApartmentByCode(renterId, joinCodeInput);

            if (result.success) {
                setJoinCodeInput("");
                setPageMessage("You joined the apartment successfully.");
                navigate(`/renter/apartments/${result.property._id}`);
            } else {
                setPageMessage(result.message || "Failed to join apartment.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsJoining(false);
        }
    }

    function formatRoommateName(roommate) {
        const fullName = `${roommate.firstName || ""} ${roommate.lastName || ""}`.trim();

        return fullName || roommate.email || "Unknown Renter";
    }

    function formatJoinedAt(joinedAt) {
        if (!joinedAt) {
            return "Join date not available";
        }

        return new Date(joinedAt).toLocaleDateString();
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                        Rentify
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Roommates
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        {property?.fullAddress || "View and invite Renters linked to this apartment."}
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
                        Loading roommates...
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Apartment Renters
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    All Renters linked to this apartment can access shared apartment data.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleGenerateJoinCode}
                                disabled={isGeneratingCode}
                                className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isGeneratingCode ? "Generating..." : "Generate Join Code"}
                            </button>
                        </div>

                        {renterJoinCode && (
                            <div className="mt-6 rounded-2xl border border-orange-200 bg-[#FFF3E8] p-5">
                                <p className="text-sm font-medium text-gray-600">
                                    Current join code
                                </p>

                                <p className="mt-2 text-3xl font-bold tracking-[0.2em] text-gray-900">
                                    {renterJoinCode}
                                </p>

                                <p className="mt-2 text-sm text-gray-600">
                                    Share this code with a Renter to let them join this apartment.
                                </p>
                            </div>
                        )}

                        {roommates.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-[#FFFCF8] px-6 py-10 text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    No roommates found
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {roommates.map((roommate) => (
                                    <div
                                        key={roommate._id}
                                        className="rounded-2xl border border-orange-100 bg-[#FFFCF8] px-5 py-4"
                                    >
                                        <p className="font-semibold text-gray-900">
                                            {formatRoommateName(roommate)}
                                        </p>

                                        {roommate.email && (
                                            <p className="mt-1 text-sm text-gray-600">
                                                {roommate.email}
                                            </p>
                                        )}

                                        <p className="mt-1 text-sm text-gray-500">
                                            Joined: {formatJoinedAt(roommate.joinedAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900">
                            Join another apartment
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Enter a join code if another Renter invited you to an apartment.
                        </p>

                        <form onSubmit={handleJoinByCode} className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={joinCodeInput}
                                onChange={(event) => setJoinCodeInput(event.target.value.toUpperCase())}
                                placeholder="Enter join code"
                                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                            />

                            <button
                                type="submit"
                                disabled={isJoining}
                                className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isJoining ? "Joining..." : "Join"}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}