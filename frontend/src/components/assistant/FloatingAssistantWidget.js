/*
Floating assistant widget.
Available on every page inside Homeowner and Renter layouts.
*/

import { useState } from "react";
import { askAssistant } from "../../services/assistantService";
import assistantRobotImage from "../../images/robot.png";

export default function FloatingAssistantWidget({ role }) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [widgetMessage, setWidgetMessage] = useState("");
    const [isAsking, setIsAsking] = useState(false);

    const suggestedQuestions =
        role === "homeowner"
            ? [
                "Show me payment risk patterns",
                "Which payments are late?",
                "Summarize my open issues",
                "Show recurring issue trends"
            ]
            : [
                "Show my bills summary",
                "Are there any unusual bills?",
                "Summarize my apartment issues",
                "Show my shared expenses"
            ];

    async function handleAskAssistant(event) {
        event.preventDefault();

        const userId = sessionStorage.getItem("userId");

        if (!userId) {
            setWidgetMessage("No user session was found. Please sign in again.");
            return;
        }

        if (!question.trim()) {
            setWidgetMessage("Please enter a question.");
            return;
        }

        setIsAsking(true);
        setWidgetMessage("");
        setAnswer(null);

        try {
            const result = await askAssistant({
                userId,
                role,
                question
            });

            if (result.success) {
                setAnswer(result.answer);
            } else {
                setWidgetMessage(result.message || "Assistant failed to answer.");
            }
        } catch (error) {
            setWidgetMessage("Server error. Please try again later.");
        } finally {
            setIsAsking(false);
        }
    }

    function handleSuggestedQuestion(selectedQuestion) {
        setQuestion(selectedQuestion);
        setAnswer(null);
        setWidgetMessage("");
    }

    function handleCloseWidget() {
        setIsOpen(false);
        setQuestion("");
        setAnswer(null);
        setWidgetMessage("");
    }

    return (
        <>
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md rounded-3xl border border-orange-200 bg-[#FFF8F3] shadow-2xl">
                    <div className="flex items-start justify-between border-b border-orange-100 px-5 py-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF8A00]">
                                Smart Assistant
                            </p>

                            <h2 className="mt-1 text-lg font-bold text-gray-900">
                                How can I help?
                            </h2>

                            <p className="mt-1 text-xs text-gray-600">
                                Ask quick questions about your Rentify data.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleCloseWidget}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-orange-50 hover:text-gray-800"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
                        {widgetMessage && (
                            <div className="mb-4 rounded-2xl border border-orange-200 bg-[#FFFCF8] px-4 py-3">
                                <p className="text-sm font-medium text-gray-700">
                                    {widgetMessage}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleAskAssistant} className="space-y-3">
                            <textarea
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                rows={3}
                                placeholder={
                                    role === "homeowner"
                                        ? "Example: Which payments are late?"
                                        : "Example: Are there any unusual bills?"
                                }
                                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                            />

                            <button
                                type="submit"
                                disabled={isAsking}
                                className="w-full rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isAsking ? "Thinking..." : "Ask Assistant"}
                            </button>
                        </form>

                        <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700">
                                Suggested questions
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {suggestedQuestions.map((suggestedQuestion) => (
                                    <button
                                        key={suggestedQuestion}
                                        type="button"
                                        onClick={() => handleSuggestedQuestion(suggestedQuestion)}
                                        className="rounded-full border border-orange-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-orange-50"
                                    >
                                        {suggestedQuestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {answer && (
                            <div className="mt-5 rounded-2xl border border-orange-100 bg-[#FFFCF8] p-4">
                                <h3 className="text-base font-bold text-gray-900">
                                    {answer.title}
                                </h3>

                                <div className="mt-3 space-y-2">
                                    {(answer.lines || []).map((line, index) => (
                                        <p
                                            key={`${line}-${index}`}
                                            className="text-sm leading-6 text-gray-700"
                                        >
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
                {!isOpen && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="relative mb-12 translate-x-3 min-w-[145px] rounded-2xl border border-orange-100 bg-white px-4 py-2 text-left text-xs font-medium text-gray-700 shadow-lg transition hover:bg-orange-50 whitespace-nowrap"
                    >
                        How can I help you?

                        <span className="absolute -bottom-1 right-4 h-3 w-3 rotate-45 border-r border-b border-orange-100 bg-white" />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="transition hover:scale-105"
                    aria-label="Open smart assistant"
                >
                    <img
                        src={assistantRobotImage}
                        alt="Smart Assistant"
                        className="h-16 w-16 object-contain drop-shadow-xl"
                    />
                </button>
            </div>
        </>
    );
}