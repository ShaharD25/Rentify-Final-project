const Property = require("../models/property.model");
const User = require("../models/user");
const crypto = require("crypto");

/*
Create a new property and connect it to the matching homeowner.
*/
async function createProperty(propertyData) {
    const {
        fullAddress,
        monthlyRent,
        billingDate,
        rentalStartDate,
        rentalEndDate,
        homeownerId
    } = propertyData;

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
            message: "Only a homeowner can create a property."
        };
    }

    const newProperty = new Property({
        fullAddress: fullAddress.trim(),
        monthlyRent,
        billingDate,
        rentalStartDate,
        rentalEndDate,
        homeowner: homeownerId,
        renterJoinCode: generateRenterJoinCode()
    });

    await newProperty.save();

    return {
        success: true,
        message: "Property created successfully.",
        property: {
            id: newProperty._id,
            fullAddress: newProperty.fullAddress,
            monthlyRent: newProperty.monthlyRent,
            billingDate: newProperty.billingDate,
            rentalStartDate: newProperty.rentalStartDate,
            rentalEndDate: newProperty.rentalEndDate,
            homeowner: newProperty.homeowner,
            renterJoinCode: newProperty.renterJoinCode
        }
    };
}

/*
Get all properties that belong to one homeowner.
*/
async function getHomeownerProperties(homeownerId) {
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
            message: "Only a homeowner can view these properties."
        };
    }

    const properties = await Property.find({ homeowner: homeownerId })
        .populate("renters", "firstName lastName email role")
        .sort({
            createdAt: -1
        });

    return {
        success: true,
        properties
    };
}

/*
Get one property by id for the property details page.
*/
async function getPropertyById(propertyId) {
    const property = await Property.findById(propertyId).populate(
        "renters",
        "firstName lastName email role"
    );
    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    return {
        success: true,
        property
    };
}

/*
Add one renter user to a property by email.
*/
async function addRenterToProperty(propertyId, renterEmail) {
    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const normalizedEmail = renterEmail.trim().toLowerCase();

    const renter = await User.findOne({ email: normalizedEmail });

    if (!renter) {
        return {
            success: false,
            message: "No renter account was found with this email."
        };
    }

    if (renter.role !== "renter") {
        return {
            success: false,
            message: "The selected user is not a renter."
        };
    }

    const isAlreadyLinked = property.renters.some(
        (renterId) => renterId.toString() === renter._id.toString()
    );

    if (isAlreadyLinked) {
        return {
            success: false,
            message: "This renter is already linked to this property."
        };
    }

    property.renters.push(renter._id);
    await property.save();

    const updatedProperty = await Property.findById(propertyId).populate(
        "renters",
        "firstName lastName email role"
    );

    return {
        success: true,
        message: "Renter added successfully.",
        property: updatedProperty
    };
}

/*
Remove one renter from a property by renter user id.
*/
async function removeRenterFromProperty(propertyId, renterId) {
    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    if (!property.renters || property.renters.length === 0) {
        return {
            success: false,
            message: "No renters were found for this property."
        };
    }

    property.renters = property.renters.filter(
        (currentRenterId) => currentRenterId.toString() !== renterId.toString()
    );

    await property.save();

    const updatedProperty = await Property.findById(propertyId).populate(
        "renters",
        "firstName lastName email role"
    );

    return {
        success: true,
        message: "Renter removed successfully.",
        property: updatedProperty
    };
}

/*
Upload or replace the contract for a property.
Archives the old contract metadata before replacing it.
*/
async function uploadContractToProperty(propertyId, contractData) {
    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const {
        contractFileName,
        contractFileUrl,
        contractUploadedBy
    } = contractData;

    if (!contractFileName || !contractFileUrl) {
        return {
            success: false,
            message: "Contract file data is required."
        };
    }

    if (property.contractFileName && property.contractFileUrl) {
        if (!property.contractHistory) {
            property.contractHistory = [];
        }

        property.contractHistory.push({
            fileName: property.contractFileName,
            fileUrl: property.contractFileUrl,
            uploadedAt: property.contractUploadedAt || null,
            uploadedBy: property.contractUploadedBy || "",
            archivedAt: new Date()
        });
    }

    property.contractFileName = contractFileName;
    property.contractFileUrl = contractFileUrl;
    property.contractUploadedAt = new Date();
    property.contractUploadedBy = contractUploadedBy || "Unknown";

    await property.save();

    return {
        success: true,
        message: "Contract uploaded successfully.",
        property
    };
}

/*
Generate a short join code for linking renters to a property.
*/
function generateRenterJoinCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

/*
Get all properties linked to one renter.
*/
async function getRenterProperties(renterId) {
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
            message: "Only a renter can view these apartments."
        };
    }

    const properties = await Property.find({ renters: renterId })
        .populate("homeowner", "firstName lastName email")
        .populate("renters", "firstName lastName email role")
        .sort({ createdAt: -1 });

    return {
        success: true,
        properties
    };
}

/*
Link a renter to a property using a renter join code.
*/
async function joinPropertyByCode(renterId, renterJoinCode) {
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
            message: "Only a renter can add an apartment."
        };
    }

    const property = await Property.findOne({
        renterJoinCode: renterJoinCode.trim().toUpperCase()
    });

    if (!property) {
        return {
            success: false,
            message: "No property was found for this join code."
        };
    }

    const isAlreadyLinked = property.renters.some(
        (currentRenterId) => currentRenterId.toString() === renterId.toString()
    );

    if (isAlreadyLinked) {
        return {
            success: false,
            message: "You are already linked to this apartment."
        };
    }

    property.renters.push(renterId);
    await property.save();

    const updatedProperty = await Property.findById(property._id)
        .populate("homeowner", "firstName lastName email")
        .populate("renters", "firstName lastName email role");

    return {
        success: true,
        message: "Apartment added successfully.",
        property: updatedProperty
    };
}

module.exports = {
    createProperty,
    getHomeownerProperties,
    getPropertyById,
    addRenterToProperty,
    removeRenterFromProperty,
    uploadContractToProperty,
    getRenterProperties,
    joinPropertyByCode
};