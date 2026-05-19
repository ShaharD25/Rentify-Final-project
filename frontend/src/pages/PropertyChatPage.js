/*
Property chat page.
Displays a group chat for one property between the Homeowner and linked Renters.
*/

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../services/apiConfig";
import {
    getPropertyChat,
    markPropertyChatAsRead,
    sendPropertyChatMessage
} from "../services/chatService";

export default function PropertyChatPage({ role }) {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [chat, setChat] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [chatFile, setChatFile] = useState(null);
    const [pageMessage, setPageMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const userId = sessionStorage.getItem("userId");
    const firstName = sessionStorage.getItem("firstName") || "";

    useEffect(() => {
        async function loadChat() {
            if (!userId || !role) {
                setPageMessage("No user session was found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getPropertyChat(propertyId, userId, role);

                if (result.success) {
                    setProperty(result.property);

                    const readResult = await markPropertyChatAsRead(propertyId, {
                        userId,
                        role
                    });

                    if (readResult.success) {
                        setChat(readResult.chat);
                        window.dispatchEvent(new Event("chatUnreadUpdated"));
                    } else {
                        setChat(result.chat);
                    }
                } else {
                    setPageMessage(result.message || "Failed to load chat.");
                }
            } catch (error) {
                setPageMessage("Server error. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadChat();
    }, [propertyId, role, userId]);

    const serverBaseUrl = useMemo(() => API_BASE_URL.replace("/api", ""), []);

    // Sends a new text or file message.
    async function handleSendMessage(event) {
        event.preventDefault();

        if (!messageText.trim() && !chatFile) {
            setPageMessage("Message text or file is required.");
            return;
        }

        setIsSending(true);
        setPageMessage("");

        try {
            const result = await sendPropertyChatMessage(propertyId, {
                senderId: userId,
                senderRole: role,
                text: messageText,
                chatFile
            });

            if (result.success) {
                setChat(result.chat);
                setMessageText("");
                setChatFile(null);
                window.dispatchEvent(new Event("chatUnreadUpdated"));
            } else {
                setPageMessage(result.message || "Failed to send message.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsSending(false);
        }
    }

    // Builds a readable back path based on the current user role.
    function handleBack() {
        if (role === "homeowner") {
            navigate(`/homeowner/properties/${propertyId}`);
            return;
        }

        navigate(`/renter/apartments/${propertyId}`);
    }

    // Builds a full file URL for uploaded chat files.
    function getFileUrl(fileUrl) {
        if (!fileUrl) {
            return "";
        }

        return `${serverBaseUrl}${fileUrl}`;
    }

    // Checks whether a message was sent by the current user.
    function isMyMessage(message) {
        const senderId = message.sender?._id || message.sender;
        return senderId?.toString() === userId?.toString();
    }

    // Checks whether a message was read by someone other than the sender.
    function wasSeenByOtherUsers(message) {
        const readers = message.readBy || [];

        return readers.some((readItem) => {
            const readUserId = readItem.user?._id || readItem.user;
            return readUserId?.toString() !== userId?.toString();
        });
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                        Rentify
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Property Chat
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        {property?.fullAddress || "Group communication for this property"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleBack}
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
                        Loading chat...
                    </p>
                </div>
            ) : (
                <section className="overflow-hidden rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 shadow-sm">
                    <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                        {(chat?.messages || []).length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-orange-200 bg-[#FFFCF8] px-6 py-10 text-center">
                                <h3 className="text-lg font-bold text-gray-900">
                                    No messages yet
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    Start the conversation with the Homeowner and Renters linked to this property.
                                </p>
                            </div>
                        ) : (
                            chat.messages.map((message) => {
                                const isMine = isMyMessage(message);

                                return (
                                    <div
                                        key={message._id}
                                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-3xl border px-4 py-3 shadow-sm sm:max-w-[70%] ${isMine
                                                    ? "border-orange-200 bg-[#FFF3E8]"
                                                    : "border-orange-100 bg-[#FFFCF8]"
                                                }`}
                                        >
                                            <div className="mb-1 flex items-center justify-between gap-3">
                                                <p className="text-xs font-semibold text-gray-700">
                                                    {message.senderName}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </p>
                                            </div>

                                            {message.text && (
                                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                                                    {message.text}
                                                </p>
                                            )}

                                            {message.fileUrl && (
                                                <a
                                                    href={getFileUrl(message.fileUrl)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 block rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-[#B45309] transition hover:bg-orange-50"
                                                >
                                                    Open file: {message.fileName || "Attachment"}
                                                </a>
                                            )}

                                            {isMine && (
                                                <p className="mt-2 text-right text-xs text-gray-400">
                                                    {wasSeenByOtherUsers(message) ? "Seen" : "Sent"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form
                        onSubmit={handleSendMessage}
                        className="border-t border-orange-100 bg-[#FFFCF8] p-4"
                    >
                        <div className="flex flex-col gap-3">
                            <textarea
                                value={messageText}
                                onChange={(event) => setMessageText(event.target.value)}
                                placeholder={`Write a message${firstName ? `, ${firstName}` : ""}...`}
                                rows={3}
                                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                            />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                                    onChange={(event) => setChatFile(event.target.files[0] || null)}
                                    className="text-sm text-gray-600"
                                />

                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSending ? "Sending..." : "Send Message"}
                                </button>
                            </div>

                            {chatFile && (
                                <p className="text-xs text-gray-500">
                                    Selected file: {chatFile.name}
                                </p>
                            )}
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}