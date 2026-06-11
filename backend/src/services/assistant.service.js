const Payment = require("../models/payment.model");
const Issue = require("../models/issue.model");
const Property = require("../models/property.model");
const Bill = require("../models/bill.model");
const Chat = require("../models/chat.model");
const User = require("../models/user");
const aiService = require("./ai.service");

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
Calculate how many months passed between two dates.
Used as a feature for the payment risk model.
*/
function calculateMonthsBetween(startDate, endDate) {
    if (!startDate || !endDate) {
        return 1;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();

    return Math.max(1, yearsDifference * 12 + monthsDifference + 1);
}

/*
Calculate delay days between due date and paid date.
If the payment is late and has no paid date, use today's date.
*/
function calculateDelayDays(payment) {
    if (!payment || !payment.dueDate) {
        return 0;
    }

    const dueDate = new Date(payment.dueDate);
    let compareDate = payment.paidAt ? new Date(payment.paidAt) : null;

    if (!compareDate && payment.status === "late") {
        compareDate = new Date();
    }

    if (!compareDate) {
        return 0;
    }

    const differenceInMs = compareDate.getTime() - dueDate.getTime();
    const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

    return Math.max(0, differenceInDays);
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
Answer which Renter or Property has the highest monthly rent.
*/
async function answerHighestPayingRenter(homeownerId) {
    const properties = await Property.find({ homeowner: homeownerId })
        .populate("renters.renter", "firstName lastName email")
        .sort({ monthlyRent: -1 });

    if (properties.length === 0) {
        return buildResponse("Highest monthly rent", [
            "No properties were found for this Homeowner."
        ]);
    }

    const propertiesWithRent = properties.filter((property) => {
        return Number(property.monthlyRent || 0) > 0;
    });

    if (propertiesWithRent.length === 0) {
        return buildResponse("Highest monthly rent", [
            "No monthly rent values were found for your properties."
        ]);
    }

    const highestProperty = propertiesWithRent[0];

    const renterNames = (highestProperty.renters || [])
        .map((renterEntry) => {
            const renter = renterEntry.renter;

            if (!renter) {
                return null;
            }

            return `${renter.firstName || ""} ${renter.lastName || ""}`.trim() || renter.email;
        })
        .filter(Boolean);

    return buildResponse("Highest monthly rent", [
        `The highest monthly rent is ${formatMoney(highestProperty.monthlyRent)}.`,
        `Property: ${highestProperty.fullAddress}.`,
        `Renter${renterNames.length > 1 ? "s" : ""}: ${renterNames.length > 0 ? renterNames.join(", ") : "No renters assigned."}`,
        "Note: Monthly rent is stored per property, so if there are roommates, this is the total rent for the apartment."
    ]);
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

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentMonthPayments = payments.filter((payment) => {
        return payment.month === currentMonth && payment.year === currentYear;
    });

    const currentMonthPaidIncome = currentMonthPayments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0);

    const currentMonthExpectedIncome = currentMonthPayments
        .reduce((sum, payment) => sum + payment.amount, 0);

    if (
        question.includes("highest") ||
        question.includes("most") ||
        question.includes("largest") ||
        question.includes("top renter") ||
        question.includes("paying the highest") ||
        question.includes("pays the most")
    ) {
        return answerHighestPayingRenter(homeownerId);
    }

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
        return buildResponse("Monthly income summary", [
            `Current month: ${currentMonth}/${currentYear}`,
            `Expected monthly income: ${formatMoney(currentMonthExpectedIncome)}`,
            `Paid income this month: ${formatMoney(currentMonthPaidIncome)}`,
            `Paid records this month: ${currentMonthPayments.filter((payment) => payment.status === "paid").length}`,
            `Unpaid records this month: ${currentMonthPayments.filter((payment) => payment.status === "unpaid").length}`,
            `Late records this month: ${currentMonthPayments.filter((payment) => payment.status === "late").length}`
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
Build payment risk model features for one Renter in one Property.
*/
async function buildPaymentRiskFeatures(payment, allPaymentsForRenterProperty) {
    const property = payment.property;

    const previousPayments = allPaymentsForRenterProperty.filter((currentPayment) => {
        const currentDate = new Date(currentPayment.year, currentPayment.month - 1, 1);
        const targetDate = new Date(payment.year, payment.month - 1, 1);

        return currentDate < targetDate;
    });

    const previousLatePayments = previousPayments.filter(
        (previousPayment) => previousPayment.status === "late"
    );

    const previousUnpaidPayments = previousPayments.filter(
        (previousPayment) => previousPayment.status === "unpaid"
    );

    const previousOnTimePayments = previousPayments.filter(
        (previousPayment) => previousPayment.status === "paid" && calculateDelayDays(previousPayment) === 0
    );

    const delayDays = previousPayments.map((previousPayment) => calculateDelayDays(previousPayment));
    const delayDaysWithLatePayments = delayDays.filter((delay) => delay > 0);

    const averageDelayDays =
        delayDaysWithLatePayments.length > 0
            ? delayDaysWithLatePayments.reduce((sum, delay) => sum + delay, 0) / delayDaysWithLatePayments.length
            : 0;

    const sortedPreviousPayments = [...previousPayments].sort((firstPayment, secondPayment) => {
        const firstDate = new Date(firstPayment.year, firstPayment.month - 1, 1);
        const secondDate = new Date(secondPayment.year, secondPayment.month - 1, 1);

        return secondDate - firstDate;
    });

    const lastPaymentDelayDays =
        sortedPreviousPayments.length > 0
            ? calculateDelayDays(sortedPreviousPayments[0])
            : 0;

    const openIssues = await Issue.find({
        property: property._id,
        status: { $ne: "closed" }
    });

    const highPriorityIssues = openIssues.filter((issue) => {
        return issue.priority === "high" || issue.priority === "High";
    });

    return {
        monthly_rent: payment.amount || property.monthlyRent || 0,
        billing_day: property.billingDate || new Date(payment.dueDate).getDate(),
        months_in_property: calculateMonthsBetween(property.rentalStartDate, new Date()),
        total_previous_payments: previousPayments.length,
        previous_late_payments: previousLatePayments.length,
        previous_unpaid_payments: previousUnpaidPayments.length,
        previous_on_time_payments: previousOnTimePayments.length,
        average_delay_days: Number(averageDelayDays.toFixed(2)),
        last_payment_delay_days: lastPaymentDelayDays,
        open_issues_count: openIssues.length,
        high_priority_issues_count: highPriorityIssues.length,
        contract_uploaded: property.contractFileName ? 1 : 0
    };
}

/*
Use the trained AI model to predict payment risk for Homeowner payments.
*/
async function answerHomeownerPaymentRiskWithModel(homeownerId) {
    const payments = await Payment.find({ homeowner: homeownerId })
        .populate("property", "fullAddress monthlyRent billingDate rentalStartDate contractFileName")
        .populate("renter", "firstName lastName email")
        .sort({ year: -1, month: -1, createdAt: -1 });

    if (payments.length === 0) {
        return buildResponse("Payment risk prediction", [
            "No payment records were found for your properties."
        ]);
    }

    const latestPaymentByRenterProperty = new Map();

    payments.forEach((payment) => {
        const key = `${payment.property?._id}-${payment.renter?._id}`;

        if (!latestPaymentByRenterProperty.has(key)) {
            latestPaymentByRenterProperty.set(key, payment);
        }
    });

    const riskResults = [];

    for (const latestPayment of latestPaymentByRenterProperty.values()) {
        const relatedPayments = payments.filter((payment) => {
            return (
                payment.property?._id?.toString() === latestPayment.property?._id?.toString() &&
                payment.renter?._id?.toString() === latestPayment.renter?._id?.toString()
            );
        });

        const features = await buildPaymentRiskFeatures(latestPayment, relatedPayments);
        const predictionResult = await aiService.predictPaymentRisk(features);

        if (predictionResult.success) {
            riskResults.push({
                renterName: latestPayment.renterName,
                propertyAddress: latestPayment.property?.fullAddress || "Unknown property",
                riskLabel: predictionResult.riskLabel,
                riskProbability: predictionResult.riskProbability,
                riskReason: predictionResult.riskReason
            });
        }
    }

    const sortedRiskResults = riskResults.sort((firstResult, secondResult) => {
        return secondResult.riskProbability - firstResult.riskProbability;
    });

    const highAndMediumRiskResults = sortedRiskResults.filter((result) => {
        return result.riskLabel === "High Risk" || result.riskLabel === "Medium Risk";
    });

    if (highAndMediumRiskResults.length === 0) {
        return buildResponse("Payment risk prediction", [
            "The AI model did not detect high or medium payment risk at the moment.",
            `Renter payment profiles checked: ${riskResults.length}.`
        ]);
    }

    const previewLines = highAndMediumRiskResults.slice(0, 5).flatMap((result) => {
        const probability = `${(result.riskProbability * 100).toFixed(1)}%`;

        const cleanedReasons = result.riskReason
            .replace(/^Risk probability is .*? Main factors: /, "")
            .replace("multiple previous late payments", "late payment history")
            .replace("previous unpaid payments", "unpaid payments")
            .replace("high average delay days", "high average delay")
            .replace("recent payment delay", "recent late payment")
            .replace("high priority open issues", "open high-priority issues")
            .replace("missing uploaded contract", "missing contract")
            .replace("stable payment history", "stable payment history");

        return [
            `${result.renterName} - ${result.propertyAddress}`,
            `${result.riskLabel}: ${probability}`,
            `Reasons: ${cleanedReasons}.`
        ];
    });

    return buildResponse("AI payment risk prediction", [
        `Renter payment profiles checked: ${riskResults.length}.`,
        `Medium or high risk profiles found: ${highAndMediumRiskResults.length}.`,
        "Top risk predictions:",
        ...previewLines
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
    const billCategories = [
        "electricity",
        "water",
        "internet",
        "gas",
        "arnona",
        "hoa",
        "maintenance",
        "other"
    ];

    const requestedCategory = billCategories.find((category) => {
        return question.includes(category);
    });

    if (requestedCategory) {
        const filteredBills = bills.filter((bill) => {
            return bill.category === requestedCategory;
        });

        if (filteredBills.length === 0) {
            return buildResponse(`${requestedCategory} bills`, [
                `No ${requestedCategory} bills were found for your apartment.`
            ]);
        }

        const preview = filteredBills.slice(0, 8).map((bill) => {
            const propertyAddress = bill.property?.fullAddress || "Unknown property";
            const dueDate = bill.dueDate
                ? new Date(bill.dueDate).toLocaleDateString("en-GB")
                : "No due date";

            return `${dueDate} - ${propertyAddress} - ${formatMoney(bill.amount)}${bill.isUnusual ? " - Unusual" : ""}`;
        });

        const totalForCategory = filteredBills.reduce((sum, bill) => {
            return sum + bill.amount;
        }, 0);

        return buildResponse(`${requestedCategory} bills`, [
            `Total ${requestedCategory} bills: ${filteredBills.length}`,
            `Total amount: ${formatMoney(totalForCategory)}`,
            "Recent bills:",
            ...preview
        ]);
    }

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
Route Homeowner assistant intent to the correct data module.
*/
async function answerHomeownerByIntent(userId, question, intent) {
    const normalizedQuestion = normalizeQuestion(question);

    if (intent === "payment_risk") {
        return answerHomeownerPaymentRiskWithModel(userId);
    }

    if (intent === "payments_summary") {
        return answerHomeownerPayments(userId, normalizedQuestion);
    }

    if (intent === "issues_summary" || intent === "recurring_issues") {
        return answerHomeownerIssues(userId, normalizedQuestion);
    }

    if (intent === "general_help") {
        return buildResponse("Assistant help", [
            "You can ask me about:",
            "Payment risk, payment status, income summary.",
            "Open issues, recurring problems and maintenance trends.",
            "Example: Which Renters may pay late next month?"
        ]);
    }

    return answerHomeownerTrends(userId);
}

/*
Route Renter assistant intent to the correct data module.
*/
async function answerRenterByIntent(userId, question, intent) {
    const normalizedQuestion = normalizeQuestion(question);

    if (intent === "bills_summary" || intent === "unusual_bills") {
        return answerRenterBills(userId, normalizedQuestion);
    }

    if (intent === "issues_summary" || intent === "recurring_issues") {
        return answerRenterIssues(userId);
    }

    if (intent === "general_help") {
        return buildResponse("Assistant help", [
            "You can ask me about:",
            "Apartment bills, unusual expenses and shared costs.",
            "Apartment issues and maintenance status.",
            "Example: Are there any unusual bills?"
        ]);
    }

    return buildResponse("Assistant help", [
        "I can help with bills, unusual expenses, apartment issues and rental information."
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

    let detectedIntent = "general_help";

    try {
        const intentResult = await aiService.classifyIntent(question);

        if (intentResult.success && intentResult.intent) {
            detectedIntent = intentResult.intent;
        }
    } catch (error) {
        console.error("AI intent classification failed:", error.message);
    }

    if (role === "homeowner") {
        return answerHomeownerByIntent(userId, question, detectedIntent);
    }

    if (role === "renter") {
        return answerRenterByIntent(userId, question, detectedIntent);
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