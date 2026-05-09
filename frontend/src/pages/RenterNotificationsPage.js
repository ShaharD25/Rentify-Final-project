/*
Renter notifications page.
Displays renter notifications and allows handling property invitations.
*/

import { useEffect, useState } from "react";
import {
    acceptPropertyInvitation,
    declinePropertyInvitation,
    getRenterNotifications,
    markNotificationAsRead
} from "../services/notificationService";

export default function RenterNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    async function loadNotifications() {
        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await getRenterNotifications(renterId);

            if (result.success) {
                setNotifications(result.notifications || []);
            } else {
                setPageMessage(result.message || "Failed to load notifications.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadNotifications();
    }, []);

    async function handleMarkAsRead(notificationId) {
        await markNotificationAsRead(notificationId);
        await loadNotifications();
    }

    async function handleAccept(notificationId) {
        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        const result = await acceptPropertyInvitation(notificationId, renterId);

        if (result.success) {
            setPageMessage("Invitation accepted. The property was added to your apartments.");
            await loadNotifications();
        } else {
            setPageMessage(result.message || "Failed to accept invitation.");
        }
    }

    async function handleDecline(notificationId) {
        const renterId = sessionStorage.getItem("userId");

        if (!renterId) {
            setPageMessage("No renter session was found. Please sign in again.");
            return;
        }

        const result = await declinePropertyInvitation(notificationId, renterId);

        if (result.success) {
            setPageMessage("Invitation declined.");
            await loadNotifications();
        } else {
            setPageMessage(result.message || "Failed to decline invitation.");
        }
    }

    function formatStatus(notification) {
        if (notification.invitationStatus === "accepted") {
            return "Accepted";
        }

        if (notification.invitationStatus === "declined") {
            return "Declined";
        }

        return "Pending";
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6">
                <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                    Rentify
                </p>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Notifications
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    View property invitations and system updates.
                </p>
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
                        Loading notifications...
                    </p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">
                        No notifications yet
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Property invitations will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`rounded-3xl border p-5 shadow-sm ${
                                notification.isRead
                                    ? "border-orange-100 bg-[#FFF8F3]/95"
                                    : "border-orange-300 bg-[#FFE8D1]"
                            }`}
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {notification.title}
                                        </h3>

                                        {!notification.isRead && (
                                            <span className="rounded-full bg-[#FF8A00] px-3 py-1 text-xs font-semibold text-white">
                                                New
                                            </span>
                                        )}

                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                                            {formatStatus(notification)}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-gray-700">
                                        {notification.message}
                                    </p>

                                    {notification.property && (
                                        <div className="mt-3 text-sm text-gray-600">
                                            <p>
                                                <span className="font-medium text-gray-800">
                                                    Property:
                                                </span>{" "}
                                                {notification.property.fullAddress}
                                            </p>

                                            <p>
                                                <span className="font-medium text-gray-800">
                                                    Monthly rent:
                                                </span>{" "}
                                                ₪{notification.property.monthlyRent}
                                            </p>

                                            <p>
                                                <span className="font-medium text-gray-800">
                                                    Payment date:
                                                </span>{" "}
                                                {notification.property.billingDate}
                                            </p>
                                        </div>
                                    )}

                                    <p className="mt-3 text-xs text-gray-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {!notification.isRead && (
                                        <button
                                            type="button"
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-orange-50"
                                        >
                                            Mark read
                                        </button>
                                    )}

                                    {notification.type === "property_invitation" &&
                                        notification.invitationStatus === "pending" && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccept(notification._id)}
                                                    className="rounded-xl bg-[#FF8A00] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#E67C00]"
                                                >
                                                    Accept
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDecline(notification._id)}
                                                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}