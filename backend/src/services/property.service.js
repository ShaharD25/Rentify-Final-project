const Property = require("../models/property.model");
const User = require("../models/user");

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

    // Check that the homeowner exists.
    const homeowner = await User.findById(homeownerId);

    if (!homeowner) {
        return {
            success: false,
            message: "Homeowner not found."
        };
    }

    // Make sure only homeowners can create properties.
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
        homeowner: homeownerId
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
            homeowner: newProperty.homeowner
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

    const properties = await Property.find({ homeowner: homeownerId }).sort({
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
    const property = await Property.findById(propertyId);

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
Add one renter name to a property.
*/
async function addRenterToProperty(propertyId, renterName) {
    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const trimmedRenterName = renterName.trim();

    if (!trimmedRenterName) {
        return {
            success: false,
            message: "Renter name is required."
        };
    }

    if (!property.renters) {
        property.renters = [];
    }

    property.renters.push(trimmedRenterName);
    await property.save();

    return {
        success: true,
        message: "Renter added successfully.",
        property
    };
}

module.exports = {
    createProperty,
    getHomeownerProperties,
    getPropertyById,
    addRenterToProperty
};