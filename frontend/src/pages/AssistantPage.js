/*
Smart assistant page.
Allows Homeowner and Renter users to ask natural language questions
about their system data.
*/

import { useState } from "react";
import { askAssistant } from "../services/assistantService";

export default function AssistantPage({ role }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [pageMessage, setPageMessage] = useState("");
    const [isAsking, setIsAsking] = useState(false);

    const suggestedQuestions =
        role === "homeowner"
            ? [
                "Show me payment risk patterns",
                "Which payments are late?",
                "Summarize my open issues",
                "Show recurring issue trends",
                "Give me a management overview"
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
            setPageMessage("No user session was found. Please sign in again.");
            return;
        }

        if (!question.trim()) {
            setPageMessage("Please enter a question.");
            return;
        }

        setIsAsking(true);
        setPageMessage("");
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
                setPageMessage(result.message || "Assistant failed to answer.");
            }
        } catch (error) {
            setPageMessage("Server error. Please try again later.");
        } finally {
            setIsAsking(false);
        }
    }

    function handleSuggestedQuestion(selectedQuestion) {
        setQuestion(selectedQuestion);
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6">
                <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
                    Rentify
                </p>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Smart Assistant
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    Ask quick questions about your Rentify data.
                </p>
            </header>

            {pageMessage && (
                <div className="mb-5 rounded-2xl border border-orange-200 bg-[#FFF8F3] px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">
                        {pageMessage}
                    </p>
                </div>
            )}

            <section className="rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-gray-900">
                    Ask a question
                </h2>

                <form onSubmit={handleAskAssistant} className="mt-5 space-y-4">
                    <textarea
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={4}
                        placeholder={
                            role === "homeowner"
                                ? "Example: Which Renters have late payment patterns?"
                                : "Example: Are there any unusual bills?"
                        }
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    />

                    <button
                        type="submit"
                        disabled={isAsking}
                        className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isAsking ? "Thinking..." : "Ask Assistant"}
                    </button>
                </form>

                <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-700">
                        Suggested questions
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {suggestedQuestions.map((suggestedQuestion) => (
                            <button
                                key={suggestedQuestion}
                                type="button"
                                onClick={() => handleSuggestedQuestion(suggestedQuestion)}
                                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50"
                            >
                                {suggestedQuestion}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {answer && (
                <section className="mt-6 rounded-3xl border border-orange-100 bg-[#FFFCF8] p-6 shadow-sm sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900">
                        {answer.title}
                    </h2>

                    <div className="mt-4 space-y-2">
                        {(answer.lines || []).map((line, index) => (
                            <p
                                key={`${line}-${index}`}
                                className="text-sm leading-6 text-gray-700"
                            >
                                {line}
                            </p>
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-6 rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                    Implementation note
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    This assistant currently uses configured intent parsing and system data retrieval.
                    The payment risk model will be trained next using synthetic data and connected to the assistant insights.
                </p>
            </section>
        </div>
    );
}