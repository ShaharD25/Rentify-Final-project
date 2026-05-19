/*
Chats page.
Shows all property chats available for the current user.
Homeowner sees chats grouped by property address.
Renter sees chats for linked apartments.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getHomeownerChats,
    getRenterChats
} from "../services/chatService";

export default function ChatsPage({ role }) {
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadChats() {
            const userId = sessionStorage.getItem("userId");

            if (!userId) {
                setPageMessage("No user session was found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            try {
                const result =
                    role === "homeowner"
                        ? await getHomeownerChats(userId)
                        : await getRenterChats(userId);

                if (result.success) {
                    setChats(result.chats || []);
                } else {
                    setPageMessage(result.message || "Failed to load chats.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadChats();
    }, [role]);

    // Opens the selected property chat based on user role.
    function handleOpenChat(propertyId) {
        if (role === "homeowner") {
            navigate(`/homeowner/properties/${propertyId}/chat`);
            return;
        }

        navigate(`/renter/apartments/${propertyId}/chat`);
    }

    // Builds a readable last message preview.
    function getLastMessagePreview(chat) {
        if (!chat.lastMessage) {
            return "No messages yet";
        }

        if (chat.lastMessage.text) {
            return chat.lastMessage.text;
        }

        if (chat.lastMessage.fileName) {
            return `File: ${chat.lastMessage.fileName}`;
        }

        return "New message";
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6">
                <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                    Rentify
                </p>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Chat
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    {role === "homeowner"
                        ? "Manage conversations by property address."
                        : "Open conversations for your linked apartments."}
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
                        Loading chats...
                    </p>
                </div>
            ) : chats.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-200 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900">
                        No chats yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        Chats will appear here when properties are available.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-orange-100 bg-[#FFF8F3] shadow-sm">
                    {chats.map((chat) => (
                        <button
                            key={chat.property._id}
                            type="button"
                            onClick={() => handleOpenChat(chat.property._id)}
                            className={`flex w-full items-center justify-between gap-4 border-b border-orange-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-[#FFF3E8] ${
                                chat.unreadCount > 0 ? "bg-[#FFF3E8]" : "bg-[#FFFCF8]"
                            }`}
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {chat.unreadCount > 0 && (
                                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                            {chat.unreadCount}
                                        </span>
                                    )}

                                    <h3 className="truncate text-sm font-bold text-gray-900">
                                        {chat.property.fullAddress}
                                    </h3>
                                </div>

                                <p className="mt-1 truncate text-sm text-gray-600">
                                    {getLastMessagePreview(chat)}
                                </p>
                            </div>

                            <span className="text-lg font-semibold text-gray-400">
                                ›
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}