/*
Homeowner notifications page.
Displays homeowner notifications as compact rows.
Opens each notification in a modal and marks it as read.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUserNotifications,
    markNotificationAsRead
} from "../services/notificationService";
import NotificationDetailsModal from "../components/notifications/NotificationDetailsModal";

export default function HomeownerNotificationsPage() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadNotifications() {
            const homeownerId = sessionStorage.getItem("userId");

            if (!homeownerId) {
                setPageMessage("No homeowner session was found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getUserNotifications(homeownerId);

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

        loadNotifications();
    }, []);

    // Converts notification type values into short UI labels.
    function getNotificationTypeLabel(type) {
        if (type === "property_invitation") {
            return "Invitation";
        }

        if (type === "issue_created") {
            return "Issue";
        }

        if (type === "issue_status_updated") {
            return "Issue Update";
        }

        if (type === "contract_uploaded") {
            return "New Contract";
        }

        if (type === "contract_updated") {
            return "Contract Update";
        }

        if (type === "payment_created") {
            return "Payment";
        }

        if (type === "payment_late") {
            return "Late Payment";
        }

        if (type === "payment_status_updated") {
            return "Payment Update";
        }

        return "System";
    }

    // Opens the notification modal and marks unread notifications as read.
    async function handleOpenNotification(notification) {
        setSelectedNotification({
            ...notification,
            isRead: true
        });

        if (notification.isRead) {
            return;
        }

        setNotifications((prevNotifications) =>
            prevNotifications.map((item) =>
                item._id === notification._id
                    ? { ...item, isRead: true }
                    : item
            )
        );

        window.dispatchEvent(new Event("notificationsUpdated"));

        try {
            await markNotificationAsRead(notification._id);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }

    // Opens the relevant screen based on the selected notification type.
    function handleOpenRelatedItem() {
        if (!selectedNotification) {
            return;
        }

        if (
            selectedNotification.type === "issue_created" &&
            selectedNotification.issue?._id
        ) {
            navigate(`/homeowner/issues/${selectedNotification.issue._id}`);
            return;
        }

        if (
            selectedNotification.type === "payment_created" ||
            selectedNotification.type === "payment_late"
        ) {
            navigate("/homeowner/payments");
            return;
        }

        if (
            selectedNotification.type === "contract_uploaded" ||
            selectedNotification.type === "contract_updated"
        ) {
            if (selectedNotification.property?._id) {
                navigate(`/homeowner/properties/${selectedNotification.property._id}`);
            }
        }
    }

    // Filters notifications by type or unread status.
    const filteredNotifications = notifications.filter((notification) => {
        if (selectedFilter === "all") {
            return true;
        }

        if (selectedFilter === "unread") {
            return !notification.isRead;
        }

        return notification.type === selectedFilter;
    });

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
                    View new issue reports and important property updates.
                </p>
            </header>

            <section className="mb-5 rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-5 shadow-sm">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Filter notifications
                </label>

                <select
                    value={selectedFilter}
                    onChange={(event) => setSelectedFilter(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100 sm:w-72"
                >
                    <option value="all">All notifications</option>
                    <option value="unread">Unread only</option>
                    <option value="issue_created">Issues</option>
                    <option value="payment_created">New payments</option>
                    <option value="payment_late">Late payments</option>
                    <option value="contract_uploaded">New contracts</option>
                    <option value="contract_updated">Contract updates</option>
                </select>
            </section>

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
            ) : filteredNotifications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">
                        No notifications yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        New issue reports will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-orange-100 bg-[#FFF8F3] shadow-sm">
                    {filteredNotifications.map((notification) => (
                        <button
                            key={notification._id}
                            type="button"
                            onClick={() => handleOpenNotification(notification)}
                            className={`flex w-full items-center justify-between gap-4 border-b border-orange-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-[#FFF3E8] ${notification.isRead ? "bg-[#FFFCF8]" : "bg-[#FFF3E8]"
                                }`}
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {!notification.isRead && (
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                    )}

                                    <span className="rounded-full border border-orange-200 bg-[#FFF1E3] px-3 py-1 text-xs font-semibold text-[#B45309]">
                                        {getNotificationTypeLabel(notification.type)}
                                    </span>

                                    <h3
                                        className={`truncate text-sm text-gray-900 ${notification.isRead ? "font-semibold" : "font-bold"
                                            }`}
                                    >
                                        {notification.title}
                                    </h3>
                                </div>

                                <p className="mt-1 truncate text-sm text-gray-600">
                                    {notification.message}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 text-right">
                                <p className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </p>

                                <span className="text-lg font-semibold text-gray-400">
                                    ›
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <NotificationDetailsModal
                notification={selectedNotification}
                role="homeowner"
                onClose={() => setSelectedNotification(null)}
                onOpenRelated={handleOpenRelatedItem}
            />
        </div>
    );
}