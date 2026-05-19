const Payment = require("../models/payment.model");
const Property = require("../models/property.model");
const User = require("../models/user");
const notificationService = require("./notification.service");

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

    const properties = await Property.find({ homeowner: homeownerId })
        .populate("renters.renter", "firstName lastName email role");

    const createdPayments = [];
    const skippedPayments = [];

    for (const property of properties) {
        const renters = property.renters || [];

        for (const renterItem of renters) {
            // Extract the populated renter user from the property renters array.
            const renterUser = renterItem.renter;
            const renterId = renterUser._id;

            if (!renterUser) {
                continue;
            }

            // Build a readable renter display name for the payment record.
            const renterName =
                `${renterUser.firstName || ""} ${renterUser.lastName || ""}`.trim() ||
                renterUser.email ||
                "Unknown Renter";

            const existingPayment = await Payment.findOne({
                property: property._id,
                renter: renterId,
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
                renter: renterId,
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

            // Create an in-app notification when a monthly payment record is generated.
            await notificationService.createNotification({
                recipient: homeownerId,
                sender: homeownerId,
                property: property._id,
                type: "payment_created",
                title: "Monthly payment created",
                message: `A monthly payment record was created for ${property.fullAddress}.`
            });
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
Format payment status for notification messages.
*/
function formatPaymentStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

/*
Update one payment status.
Notifies the renter when the payment status changes.
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

    const previousStatus = payment.status;

    payment.status = status;
    payment.paidAt = status === "paid" ? new Date() : null;

    const riskData = await detectPaymentRisk(payment.property._id, payment.renterName);
    payment.riskFlag = riskData.riskFlag;
    payment.riskReason = riskData.riskReason;

    await payment.save();

    if (previousStatus !== status && payment.renter) {
        // Notify the renter when the payment status is updated.
        await notificationService.createNotification({
            recipient: payment.renter,
            sender: payment.homeowner,
            property: payment.property._id,
            type: "payment_status_updated",
            title: "Payment status updated",
            message: `Your payment for ${payment.property.fullAddress} was marked as ${formatPaymentStatus(status)}. Billing day: ${payment.property.billingDate}.`
        });
    }
    
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