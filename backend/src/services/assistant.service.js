const Payment = require("../models/payment.model");
const Issue = require("../models/issue.model");
const Property = require("../models/property.model");
const Bill = require("../models/bill.model");
const Chat = require("../models/chat.model");
const User = require("../models/user");

/*
Normalize user question for simple intent detection.
*/
function normalizeQuestion(question) {
    return (question || "").toLowerCase().trim();
}

/*
Format money values.
*/
function formatMoney(amount) {
    return `₪${Number(amount || 0).toLocaleString()}`;
}

/*
Build a simple text response.
*/
function buildResponse(title, lines) {
    return {
        success: true,
        answer: {
            title,
            lines
        }
    };
}

/*
Get Homeowner properties.
*/
async function getHomeownerPropertyIds(homeownerId) {
    const properties = await Property.find({ homeowner: homeownerId }).select("_id fullAddress");

    return {
        properties,
        propertyIds: properties.map((property) => property._id)
    };
}

/*
Answer Homeowner payment-related questions.
*/
async function answerHomeownerPayments(homeownerId, question) {
    const payments = await Payment.find({ homeowner: homeownerId })
        .populate("property", "fullAddress")
        .sort({ year: -1, month: -1, createdAt: -1 });

    const paidCount = payments.filter((payment) => payment.status === "paid").length;
    const unpaidCount = payments.filter((payment) => payment.status === "unpaid").length;
    const lateCount = payments.filter((payment) => payment.status === "late").length;
    const riskCount = payments.filter((payment) => payment.riskFlag).length;

    const paidIncome = payments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0);

    if (question.includes("late") || question.includes("risk") || question.includes("pattern")) {
        const latePayments = payments.filter((payment) => payment.status === "late" || payment.riskFlag);

        if (latePayments.length === 0) {
            return buildResponse("Payment risk summary", [
                "No late or risky payment patterns were found.",
                `Total payment records checked: ${payments.length}.`
            ]);
        }

        const preview = latePayments.slice(0, 5).map((payment) => {
            const propertyAddress = payment.property?.fullAddress || "Unknown property";
            return `${payment.renterName} - ${propertyAddress} - ${payment.status.toUpperCase()}${payment.riskFlag ? " - Risk flag" : ""}`;
        });

        return buildResponse("Late payment and risk patterns", [
            `Late payments: ${lateCount}`,
            `Risk flags: ${riskCount}`,
            "Top records:",
            ...preview
        ]);
    }

    if (question.includes("income") || question.includes("revenue") || question.includes("money")) {
        return buildResponse("Income summary", [
            `Paid income total: ${formatMoney(paidIncome)}`,
            `Paid records: ${paidCount}`,
            `Unpaid records: ${unpaidCount}`,
            `Late records: ${lateCount}`
        ]);
    }

    return buildResponse("Payment summary", [
        `Total payment records: ${payments.length}`,
        `Paid: ${paidCount}`,
        `Unpaid: ${unpaidCount}`,
        `Late: ${lateCount}`,
        `Risk flags: ${riskCount}`
    ]);
}

/*
Answer Homeowner issue-related questions.
*/
async function answerHomeownerIssues(homeownerId, question) {
    const { propertyIds } = await getHomeownerPropertyIds(homeownerId);

    const issues = await Issue.find({ property: { $in: propertyIds } })
        .populate("property", "fullAddress")
        .sort({ createdAt: -1 });

    const openIssues = issues.filter((issue) => issue.status === "open");
    const inProgressIssues = issues.filter((issue) => issue.status === "in_progress");
    const closedIssues = issues.filter((issue) => issue.status === "closed");

    const categoryCounts = issues.reduce((counts, issue) => {
        const category = issue.category || "uncategorized";
        counts[category] = (counts[category] || 0) + 1;
        return counts;
    }, {});

    const categoryLines = Object.keys(categoryCounts).map((category) => {
        return `${category}: ${categoryCounts[category]}`;
    });

    if (question.includes("recurring") || question.includes("trend") || question.includes("problem")) {
        return buildResponse("Recurring issue trends", [
            `Total issues: ${issues.length}`,
            "Issue categories:",
            ...(categoryLines.length > 0 ? categoryLines : ["No issue categories found."])
        ]);
    }

    return buildResponse("Issue summary", [
        `Total issues: ${issues.length}`,
        `Open: ${openIssues.length}`,
        `In progress: ${inProgressIssues.length}`,
        `Closed: ${closedIssues.length}`,
        "Categories:",
        ...(categoryLines.length > 0 ? categoryLines : ["No issue categories found."])
    ]);
}

/*
Answer Homeowner trend questions across payments and issues.
*/
async function answerHomeownerTrends(homeownerId) {
    const paymentResponse = await answerHomeownerPayments(homeownerId, "payment risk pattern");
    const issueResponse = await answerHomeownerIssues(homeownerId, "recurring trend");

    return buildResponse("Management trends", [
        "Payment insight:",
        ...paymentResponse.answer.lines,
        "",
        "Issue insight:",
        ...issueResponse.answer.lines
    ]);
}

/*
Answer Renter bills-related questions.
*/
async function answerRenterBills(renterId, question) {
    const properties = await Property.find({ "renters.renter": renterId }).select("_id fullAddress");
    const propertyIds = properties.map((property) => property._id);

    const bills = await Bill.find({ property: { $in: propertyIds } })
        .populate("property", "fullAddress")
        .sort({ dueDate: -1 });

    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const unusualBills = bills.filter((bill) => bill.isUnusual);

    const categoryTotals = bills.reduce((totals, bill) => {
        totals[bill.category] = (totals[bill.category] || 0) + bill.amount;
        return totals;
    }, {});

    const categoryLines = Object.keys(categoryTotals).map((category) => {
        return `${category}: ${formatMoney(categoryTotals[category])}`;
    });

    if (question.includes("unusual") || question.includes("high") || question.includes("anomaly")) {
        if (unusualBills.length === 0) {
            return buildResponse("Unusual bills", [
                "No unusual bills were found."
            ]);
        }

        const preview = unusualBills.slice(0, 5).map((bill) => {
            return `${bill.category} - ${formatMoney(bill.amount)} - ${bill.anomalyReason || "Marked as unusual"}`;
        });

        return buildResponse("Unusual bills", preview);
    }

    return buildResponse("Bills summary", [
        `Total bills: ${bills.length}`,
        `Total amount: ${formatMoney(totalAmount)}`,
        `Unusual bills: ${unusualBills.length}`,
        "Category totals:",
        ...(categoryLines.length > 0 ? categoryLines : ["No bills found."])
    ]);
}

/*
Answer Renter issue-related questions.
*/
async function answerRenterIssues(renterId) {
    const properties = await Property.find({ "renters.renter": renterId }).select("_id fullAddress");
    const propertyIds = properties.map((property) => property._id);

    const issues = await Issue.find({ property: { $in: propertyIds } })
        .populate("property", "fullAddress")
        .sort({ createdAt: -1 });

    const openIssues = issues.filter((issue) => issue.status === "open");
    const inProgressIssues = issues.filter((issue) => issue.status === "in_progress");
    const closedIssues = issues.filter((issue) => issue.status === "closed");

    return buildResponse("Apartment issues summary", [
        `Total issues: ${issues.length}`,
        `Open: ${openIssues.length}`,
        `In progress: ${inProgressIssues.length}`,
        `Closed: ${closedIssues.length}`
    ]);
}

/*
Answer a Homeowner assistant question.
*/
async function answerHomeownerQuestion(userId, question) {
    const normalizedQuestion = normalizeQuestion(question);

    if (
        normalizedQuestion.includes("payment") ||
        normalizedQuestion.includes("paid") ||
        normalizedQuestion.includes("late") ||
        normalizedQuestion.includes("income") ||
        normalizedQuestion.includes("risk")
    ) {
        return answerHomeownerPayments(userId, normalizedQuestion);
    }

    if (
        normalizedQuestion.includes("issue") ||
        normalizedQuestion.includes("maintenance") ||
        normalizedQuestion.includes("problem") ||
        normalizedQuestion.includes("recurring")
    ) {
        return answerHomeownerIssues(userId, normalizedQuestion);
    }

    if (
        normalizedQuestion.includes("trend") ||
        normalizedQuestion.includes("summary") ||
        normalizedQuestion.includes("overview")
    ) {
        return answerHomeownerTrends(userId);
    }

    return buildResponse("Assistant help", [
        "You can ask me about:",
        "Payment status, late payments, risk flags, income summary.",
        "Open issues, recurring problems, maintenance trends.",
        "Example: Which Renters have late payment patterns?"
    ]);
}

/*
Answer a Renter assistant question.
*/
async function answerRenterQuestion(userId, question) {
    const normalizedQuestion = normalizeQuestion(question);

    if (
        normalizedQuestion.includes("bill") ||
        normalizedQuestion.includes("expense") ||
        normalizedQuestion.includes("cost") ||
        normalizedQuestion.includes("unusual")
    ) {
        return answerRenterBills(userId, normalizedQuestion);
    }

    if (
        normalizedQuestion.includes("issue") ||
        normalizedQuestion.includes("maintenance") ||
        normalizedQuestion.includes("problem")
    ) {
        return answerRenterIssues(userId);
    }

    return buildResponse("Assistant help", [
        "You can ask me about:",
        "Apartment bills, unusual expenses, shared costs.",
        "Apartment issues and maintenance status.",
        "Example: Are there any unusual bills?"
    ]);
}

/*
Main assistant entry point.
*/
async function askAssistant(assistantData) {
    const { userId, role, question } = assistantData;

    const user = await User.findById(userId);

    if (!user) {
        return {
            success: false,
            message: "User not found."
        };
    }

    if (!question || !question.trim()) {
        return {
            success: false,
            message: "Question is required."
        };
    }

    if (role === "homeowner") {
        return answerHomeownerQuestion(userId, question);
    }

    if (role === "renter") {
        return answerRenterQuestion(userId, question);
    }

    return {
        success: false,
        message: "Invalid role."
    };
}

/*
Generate suggested replies for Homeowner based on the latest chat message.
This is a configured assistant feature, not a socket-based real-time model.
*/
async function generateChatReplySuggestions(propertyId, userId, role) {
    if (role !== "homeowner") {
        return {
            success: true,
            suggestions: []
        };
    }

    const chat = await Chat.findOne({ property: propertyId });

    if (!chat || !chat.messages || chat.messages.length === 0) {
        return {
            success: true,
            suggestions: [
                "Hi, how can I help with the apartment?",
                "Thanks for the update. I will check it and get back to you.",
                "Can you please send more details?"
            ]
        };
    }

    const latestMessage = chat.messages[chat.messages.length - 1];
    const latestText = normalizeQuestion(latestMessage.text);

    if (!latestText) {
        return {
            success: true,
            suggestions: [
                "Thanks for sending the file. I will review it.",
                "I received the attachment and will check it.",
                "Can you please explain what I should focus on?"
            ]
        };
    }

    if (
        latestText.includes("leak") ||
        latestText.includes("water") ||
        latestText.includes("plumbing")
    ) {
        return {
            success: true,
            suggestions: [
                "Thanks for reporting this. I will check the plumbing issue and update you soon.",
                "Can you please send a photo of the leak and describe where it is located?",
                "I will review this and arrange maintenance if needed."
            ]
        };
    }

    if (
        latestText.includes("electric") ||
        latestText.includes("power") ||
        latestText.includes("spark")
    ) {
        return {
            success: true,
            suggestions: [
                "Thanks for letting me know. Please avoid using the affected electrical area until it is checked.",
                "Can you send a photo and explain which room is affected?",
                "I will look into the electrical issue and update you soon."
            ]
        };
    }

    if (
        latestText.includes("payment") ||
        latestText.includes("paid") ||
        latestText.includes("late")
    ) {
        return {
            success: true,
            suggestions: [
                "Thanks for the update. I will check the payment status.",
                "Please send the payment confirmation when available.",
                "I will review the payment record and update the system."
            ]
        };
    }

    return {
        success: true,
        suggestions: [
            "Thanks for the update. I will check it and get back to you.",
            "Can you please send more details?",
            "I received your message and will update you soon."
        ]
    };
}

module.exports = {
    askAssistant,
    generateChatReplySuggestions
};