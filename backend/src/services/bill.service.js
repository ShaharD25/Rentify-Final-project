const Bill = require("../models/bill.model");
const Property = require("../models/property.model");
const User = require("../models/user");

/*
Check whether a renter is linked to a property.
Supports both old and new renter structures.
*/
function isRenterLinkedToProperty(property, renterId) {
    return (property.renters || []).some((renterItem) => {
        const renterUser = renterItem.renter || renterItem;
        const currentRenterId = renterUser?._id || renterUser;

        return currentRenterId?.toString() === renterId.toString();
    });
}

/*
Format category names for readable messages.
*/
function formatBillCategory(category) {
    if (category === "municipal_tax") {
        return "Municipal Tax";
    }

    return category.charAt(0).toUpperCase() + category.slice(1);
}

/*
Detect unusual bills by comparing the new bill amount to historical average.
A bill is unusual when it is more than 30% higher than the category average.
*/
async function detectBillAnomaly(propertyId, category, amount) {
    const previousBills = await Bill.find({
        property: propertyId,
        category
    });

    if (previousBills.length < 2) {
        return {
            isUnusual: false,
            anomalyReason: ""
        };
    }

    const total = previousBills.reduce((sum, bill) => sum + bill.amount, 0);
    const average = total / previousBills.length;
    const threshold = average * 1.3;

    if (amount > threshold) {
        return {
            isUnusual: true,
            anomalyReason: `${formatBillCategory(category)} bill is more than 30% higher than the historical average.`
        };
    }

    return {
        isUnusual: false,
        anomalyReason: ""
    };
}

/*
Create a new bill for an apartment.
Only a Renter linked to the property can add a bill.
*/
async function createApartmentBill(billData) {
    const {
        propertyId,
        renterId,
        amount,
        dueDate,
        category,
        description
    } = billData;

    const renter = await User.findById(renterId);

    if (!renter) {
        return {
            success: false,
            message: "Renter not found."
        };
    }

    if (renter.role !== "renter") {
        return {
            success: false,
            message: "Only a renter can add apartment bills."
        };
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    if (!isRenterLinkedToProperty(property, renterId)) {
        return {
            success: false,
            message: "This renter is not linked to this apartment."
        };
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
        return {
            success: false,
            message: "Bill amount must be greater than zero."
        };
    }

    const anomalyData = await detectBillAnomaly(
        propertyId,
        category,
        numericAmount
    );

    const bill = new Bill({
        property: propertyId,
        createdByRenter: renterId,
        amount: numericAmount,
        dueDate,
        category,
        description: description || "",
        isUnusual: anomalyData.isUnusual,
        anomalyReason: anomalyData.anomalyReason
    });

    await bill.save();

    const populatedBill = await Bill.findById(bill._id)
        .populate("createdByRenter", "firstName lastName email role")
        .populate("property", "fullAddress");

    return {
        success: true,
        message: "Bill added successfully.",
        bill: populatedBill
    };
}

/*
Get all bills linked to one apartment.
Only linked Renters can view these bills.
*/
async function getApartmentBills(propertyId, renterId) {
    const renter = await User.findById(renterId);

    if (!renter) {
        return {
            success: false,
            message: "Renter not found."
        };
    }

    if (renter.role !== "renter") {
        return {
            success: false,
            message: "Only a renter can view apartment bills."
        };
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    if (!isRenterLinkedToProperty(property, renterId)) {
        return {
            success: false,
            message: "This renter is not linked to this apartment."
        };
    }

    const bills = await Bill.find({ property: propertyId })
        .populate("createdByRenter", "firstName lastName email role")
        .populate("property", "fullAddress")
        .sort({ dueDate: -1, createdAt: -1 });

    const monthlySummary = await getMonthlyBillSummary(propertyId);

    return {
        success: true,
        bills,
        monthlySummary
    };
}

/*
Calculate totals for last month, the month before, and the difference.
*/
async function getMonthlyBillSummary(propertyId) {
    const now = new Date();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthBeforeDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const lastMonth = {
        month: lastMonthDate.getMonth() + 1,
        year: lastMonthDate.getFullYear()
    };

    const monthBefore = {
        month: monthBeforeDate.getMonth() + 1,
        year: monthBeforeDate.getFullYear()
    };

    const bills = await Bill.find({ property: propertyId });

    function calculateMonthTotal(monthData) {
        return bills.reduce((sum, bill) => {
            const billDate = new Date(bill.dueDate);
            const billMonth = billDate.getMonth() + 1;
            const billYear = billDate.getFullYear();

            if (billMonth === monthData.month && billYear === monthData.year) {
                return sum + bill.amount;
            }

            return sum;
        }, 0);
    }

    const lastMonthTotal = calculateMonthTotal(lastMonth);
    const monthBeforeTotal = calculateMonthTotal(monthBefore);

    return {
        lastMonth,
        monthBefore,
        lastMonthTotal,
        monthBeforeTotal,
        difference: lastMonthTotal - monthBeforeTotal
    };
}

module.exports = {
    createApartmentBill,
    getApartmentBills
};