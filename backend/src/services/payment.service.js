const Payment = require("../models/payment.model");
const Property = require("../models/property.model");
const User = require("../models/user");

/*
Detect a simple payment risk pattern based on previous late payments.
*/
async function detectPaymentRisk(propertyId, renterName) {
    const latePaymentsCount = await Payment.countDocuments({
        property: propertyId,
        renterName,
        status: "late"
    });

    if (latePaymentsCount >= 2) {
        return {
            riskFlag: true,
            riskReason: "This renter has multiple late payments."
        };
    }

    return {
        riskFlag: false,
        riskReason: ""
    };
}

/*
Create monthly payment records for all renters in a homeowner's properties.
Existing payment records are not duplicated.
*/
async function generateMonthlyPayments(homeownerId, month, year) {
    const homeowner = await User.findById(homeownerId);

    if (!homeowner) {
        return {
            success: false,
            message: "Homeowner not found."
        };
    }

    if (homeowner.role !== "homeowner") {
        return {
            success: false,
            message: "Only a homeowner can generate payments."
        };
    }

    const properties = await Property.find({ homeowner: homeownerId });

    const createdPayments = [];
    const skippedPayments = [];

    for (const property of properties) {
        const renters = property.renters || [];

        for (const renterName of renters) {
            const existingPayment = await Payment.findOne({
                property: property._id,
                renterName,
                month,
                year
            });

            if (existingPayment) {
                skippedPayments.push(existingPayment);
                continue;
            }

            const dueDate = new Date(year, month - 1, property.billingDate);
            const riskData = await detectPaymentRisk(property._id, renterName);

            const payment = new Payment({
                property: property._id,
                homeowner: homeownerId,
                renterName,
                month,
                year,
                amount: property.monthlyRent,
                dueDate,
                status: "unpaid",
                riskFlag: riskData.riskFlag,
                riskReason: riskData.riskReason
            });

            await payment.save();
            createdPayments.push(payment);
        }
    }

    return {
        success: true,
        message: "Monthly payments generated successfully.",
        createdPayments,
        skippedPayments
    };
}

/*
Get all payment records for one homeowner.
*/
async function getHomeownerPayments(homeownerId) {
    const homeowner = await User.findById(homeownerId);

    if (!homeowner) {
        return {
            success: false,
            message: "Homeowner not found."
        };
    }

    if (homeowner.role !== "homeowner") {
        return {
            success: false,
            message: "Only a homeowner can view these payments."
        };
    }

    const payments = await Payment.find({ homeowner: homeownerId })
        .populate("property", "fullAddress monthlyRent billingDate")
        .sort({ year: -1, month: -1, createdAt: -1 });

    return {
        success: true,
        payments
    };
}

/*
Update one payment status.
*/
async function updatePaymentStatus(paymentId, status) {
    const allowedStatuses = ["unpaid", "paid", "late"];

    if (!allowedStatuses.includes(status)) {
        return {
            success: false,
            message: "Invalid payment status."
        };
    }

    const payment = await Payment.findById(paymentId).populate(
        "property",
        "fullAddress monthlyRent billingDate"
    );

    if (!payment) {
        return {
            success: false,
            message: "Payment not found."
        };
    }

    payment.status = status;
    payment.paidAt = status === "paid" ? new Date() : null;

    const riskData = await detectPaymentRisk(payment.property._id, payment.renterName);
    payment.riskFlag = riskData.riskFlag;
    payment.riskReason = riskData.riskReason;

    await payment.save();

    return {
        success: true,
        message: "Payment status updated successfully.",
        payment
    };
}

/*
Get payment history for one renter.
*/
async function getRenterPaymentHistory(homeownerId, renterName) {
    if (!homeownerId || !renterName) {
        return {
            success: false,
            message: "Homeowner id and renter name are required."
        };
    }

    const payments = await Payment.find({
        homeowner: homeownerId,
        renterName
    })
        .populate("property", "fullAddress monthlyRent billingDate")
        .sort({ year: -1, month: -1 });

    return {
        success: true,
        payments
    };
}

/*
Get simple monthly income analytics for one homeowner.
*/
async function getIncomeAnalytics(homeownerId) {
    const payments = await Payment.find({
        homeowner: homeownerId,
        status: "paid"
    });

    const incomeByMonth = {};

    payments.forEach((payment) => {
        const key = `${payment.year}-${String(payment.month).padStart(2, "0")}`;

        if (!incomeByMonth[key]) {
            incomeByMonth[key] = 0;
        }

        incomeByMonth[key] += payment.amount;
    });

    const analytics = Object.keys(incomeByMonth)
        .sort()
        .map((monthKey) => ({
            month: monthKey,
            totalIncome: incomeByMonth[monthKey]
        }));

    return {
        success: true,
        analytics
    };
}

module.exports = {
    generateMonthlyPayments,
    getHomeownerPayments,
    updatePaymentStatus,
    getRenterPaymentHistory,
    getIncomeAnalytics
};