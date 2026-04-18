const propertyService = require("../services/property.service");

/*
Create property controller.
Receives property data from the request body,
validates the main fields, and delegates the logic to the service.
*/
async function createProperty(req, res) {
    const {
        fullAddress,
        monthlyRent,
        billingDate,
        rentalStartDate,
        rentalEndDate,
        homeownerId
    } = req.body;

    if (
        !fullAddress ||
        !monthlyRent ||
        !billingDate ||
        !rentalStartDate ||
        !rentalEndDate ||
        !homeownerId
    ) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be filled."
        });
    }

    if (Number(monthlyRent) < 0) {
        return res.status(400).json({
            success: false,
            message: "Monthly rent must be 0 or higher."
        });
    }

    if (Number(billingDate) < 1 || Number(billingDate) > 31) {
        return res.status(400).json({
            success: false,
            message: "Billing date must be between 1 and 31."
        });
    }

    if (new Date(rentalEndDate) < new Date(rentalStartDate)) {
        return res.status(400).json({
            success: false,
            message: "Rental end date must be later than rental start date."
        });
    }

    const result = await propertyService.createProperty({
        fullAddress,
        monthlyRent: Number(monthlyRent),
        billingDate: Number(billingDate),
        rentalStartDate,
        rentalEndDate,
        homeownerId
    });

    return res.status(result.success ? 201 : 400).json(result);
}

/*
Get all properties for one homeowner.
*/
async function getHomeownerProperties(req, res) {
    const { homeownerId } = req.params;

    if (!homeownerId) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id is required."
        });
    }

    const result = await propertyService.getHomeownerProperties(homeownerId);

    return res.status(result.success ? 200 : 404).json(result);
}
/*
Get one property by id.
*/
async function getPropertyById(req, res) {
    const { propertyId } = req.params;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    const result = await propertyService.getPropertyById(propertyId);

    return res.status(result.success ? 200 : 404).json(result);
}

/*
Add one renter to a property.
*/
async function addRenterToProperty(req, res) {
    const { propertyId } = req.params;
    const { renterName } = req.body;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    if (!renterName || !renterName.trim()) {
        return res.status(400).json({
            success: false,
            message: "Renter name is required."
        });
    }

    const result = await propertyService.addRenterToProperty(propertyId, renterName);

    return res.status(result.success ? 200 : 404).json(result);
}

module.exports = {
    createProperty,
    getHomeownerProperties,
    getPropertyById,
    addRenterToProperty
};