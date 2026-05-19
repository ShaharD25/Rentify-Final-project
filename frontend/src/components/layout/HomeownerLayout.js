/*
Homeowner layout component.
Provides a shared sidebar and page container for all homeowner pages.
*/

import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getUnreadNotificationCount } from "../../services/notificationService";
import { getUnreadChatCount } from "../../services/chatService";
import FloatingAssistantWidget from "../assistant/FloatingAssistantWidget";

export default function HomeownerLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        async function loadUnreadNotificationsCount() {
            const homeownerId = sessionStorage.getItem("userId");

            if (!homeownerId) {
                return;
            }

            try {
                const result = await getUnreadNotificationCount(homeownerId);

                if (result.success) {
                    setUnreadNotificationsCount(result.count || 0);
                }
            } catch (error) {
                console.error("Failed to load notification count:", error);
            }
        }

        loadUnreadNotificationsCount();

        window.addEventListener("notificationsUpdated", loadUnreadNotificationsCount);

        return () => {
            window.removeEventListener("notificationsUpdated", loadUnreadNotificationsCount);
        };
    }, [location.pathname]);

    useEffect(() => {
        async function loadUnreadChatCount() {
            const homeownerId = sessionStorage.getItem("userId");

            if (!homeownerId) {
                return;
            }

            try {
                const result = await getUnreadChatCount(homeownerId, "homeowner");

                if (result.success) {
                    setUnreadChatCount(result.count || 0);
                }
            } catch (error) {
                console.error("Failed to load chat unread count:", error);
            }
        }

        loadUnreadChatCount();

        const intervalId = setInterval(loadUnreadChatCount, 15000);

        window.addEventListener("chatUnreadUpdated", loadUnreadChatCount);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("chatUnreadUpdated", loadUnreadChatCount);
        };
    }, [location.pathname]);



    function handleLogout() {
        sessionStorage.removeItem("firstName");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("role");
        navigate("/auth");
    }

    function isActiveRoute(routeKey) {
        const currentPath = location.pathname;

        if (routeKey === "dashboard") {
            return currentPath === "/homeowner";
        }

        if (routeKey === "properties") {
            return (
                currentPath.startsWith("/homeowner/properties") &&
                !currentPath.includes("/issues") &&
                !currentPath.includes("/chat")
            );
        }

        if (routeKey === "issues") {
            return (
                currentPath.startsWith("/homeowner/issues") ||
                currentPath.includes("/issues")
            );
        }

        if (routeKey === "payments") {
            return currentPath.startsWith("/homeowner/payments");
        }

        if (routeKey === "maintenance") {
            return currentPath.startsWith("/homeowner/maintenance");
        }

        if (routeKey === "chat") {
            return currentPath.startsWith("/homeowner/chat") ||
                currentPath.includes("/chat");
        }

        if (routeKey === "notifications") {
            return currentPath.startsWith("/homeowner/notifications");
        }

        if (routeKey === "settings") {
            return currentPath.startsWith("/homeowner/settings");
        }

        return false;
    }

    function getNavButtonClass(routeKey) {
        const isActive = isActiveRoute(routeKey);

        return isActive
            ? "flex w-full items-center justify-between rounded-2xl bg-[#FF8A00] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm"
            : "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50";
    }

    function handleNavigate(path) {
        navigate(path);
        setIsSidebarOpen(false);
    }

    return (
        <div className="min-h-screen bg-[#FFE8D6]">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex min-h-screen">
                <aside
                    className={`fixed left-0 top-0 z-50 flex h-full w-72 transform flex-col bg-[#FFF8F3]/95 backdrop-blur-sm border-r border-orange-100 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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

                    <nav className="flex-1 px-4 py-6">
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner")}
                                className={getNavButtonClass("dashboard")}
                            >
                                <span>Dashboard</span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/properties")}
                                className={getNavButtonClass("properties")}
                            >
                                <span>Properties</span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/issues")}
                                className={getNavButtonClass("issues")}
                            >
                                <span>Issues</span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/payments")}
                                className={getNavButtonClass("payments")}
                            >
                                <span>Payments</span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/maintenance")}
                                className={getNavButtonClass("maintenance")}
                            >
                                <span>Maintenance</span>
                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/chat")}
                                className={getNavButtonClass("chat")}
                            >
                                <span className="flex items-center gap-2">
                                    <span>Chat</span>

                                    {unreadChatCount > 0 && (
                                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                            {unreadChatCount}
                                        </span>
                                    )}
                                </span>

                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/notifications")}
                                className={getNavButtonClass("notifications")}
                            >
                                <span className="flex items-center gap-2">
                                    <span>Notifications</span>

                                    {unreadNotificationsCount > 0 && (
                                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                            {unreadNotificationsCount}
                                        </span>
                                    )}
                                </span>

                                <span>›</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/homeowner/settings")}
                                className={getNavButtonClass("settings")}
                            >
                                <span>Settings</span>
                                <span>›</span>
                            </button>
                        </div>
                    </nav>

                    <div className="mt-auto px-4 pb-4">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                        >
                            Log out
                        </button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#FFE8D6]/90 backdrop-blur-sm lg:hidden">
                        <div className="flex h-20 items-center px-4">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(true)}
                                className="rounded-2xl border border-orange-100 bg-[#FFF8F3] px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                            >
                                Menu
                            </button>
                        </div>
                    </header>

                    <main className="flex-1">
                        <Outlet />
                    </main>
                </div>
            </div>
            <FloatingAssistantWidget role="homeowner" />
        </div>
    );
}