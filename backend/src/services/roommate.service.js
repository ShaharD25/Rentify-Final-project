const Property = require("../models/property.model");
const User = require("../models/user");

/*
Check whether a Renter is linked to a property.
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
Create a short readable join code.
*/
function generateCodeValue() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/*
Build readable roommate data for the UI.
*/
function buildRoommateList(property) {
    return (property.renters || []).map((renterItem) => {
        const renterUser = renterItem.renter || renterItem;

        return {
            _id: renterUser?._id || renterUser,
            firstName: renterUser?.firstName || "",
            lastName: renterUser?.lastName || "",
            email: renterUser?.email || "",
            joinedAt: renterItem.joinedAt || null
        };
    });
}

/*
Get all roommates for one apartment.
Only linked Renters can view the roommates list.
*/
async function getApartmentRoommates(propertyId, renterId) {
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
            message: "Only a Renter can view roommates."
        };
    }

    const property = await Property.findById(propertyId)
        .populate("renters.renter", "firstName lastName email role");

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    if (!isRenterLinkedToProperty(property, renterId)) {
        return {
            success: false,
            message: "This Renter is not linked to this apartment."
        };
    }

    return {
        success: true,
        property: {
            _id: property._id,
            fullAddress: property.fullAddress,
            renterJoinCode: property.renterJoinCode,
            renterJoinCodeExpiresAt: property.renterJoinCodeExpiresAt
        },
        roommates: buildRoommateList(property)
    };
}

/*
Generate a join code for one apartment.
Only a linked Renter can generate a join code.
*/
async function generateApartmentJoinCode(propertyId, renterId) {
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
            message: "Only a Renter can generate a join code."
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
            message: "This Renter is not linked to this apartment."
        };
    }

    let renterJoinCode = generateCodeValue();
    let existingProperty = await Property.findOne({ renterJoinCode });

    while (existingProperty) {
        renterJoinCode = generateCodeValue();
        existingProperty = await Property.findOne({ renterJoinCode });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    property.renterJoinCode = renterJoinCode;
    property.renterJoinCodeExpiresAt = expiresAt;

    await property.save();

    return {
        success: true,
        message: "Join code generated successfully.",
        renterJoinCode,
        renterJoinCodeExpiresAt: expiresAt
    };
}

/*
Join an apartment using a renter join code.
The Renter gets access to all apartment data after joining.
*/
async function joinApartmentByCode(renterId, renterJoinCode) {
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
            message: "Only a Renter can join an apartment."
        };
    }

    const normalizedCode = renterJoinCode.trim().toUpperCase();

    const property = await Property.findOne({
        renterJoinCode: normalizedCode
    });

    if (!property) {
        return {
            success: false,
            message: "Invalid join code."
        };
    }

    if (
        property.renterJoinCodeExpiresAt &&
        property.renterJoinCodeExpiresAt < new Date()
    ) {
        return {
            success: false,
            message: "This join code has expired."
        };
    }

    const isAlreadyLinked = isRenterLinkedToProperty(property, renterId);

    if (isAlreadyLinked) {
        return {
            success: false,
            message: "You are already linked to this apartment."
        };
    }

    property.renters.push({
        renter: renterId,
        joinedAt: new Date()
    });

    await property.save();

    const updatedProperty = await Property.findById(property._id)
        .populate("homeowner", "firstName lastName email role")
        .populate("renters.renter", "firstName lastName email role");

    return {
        success: true,
        message: "You joined the apartment successfully.",
        property: updatedProperty
    };
}

module.exports = {
    getApartmentRoommates,
    generateApartmentJoinCode,
    joinApartmentByCode
};