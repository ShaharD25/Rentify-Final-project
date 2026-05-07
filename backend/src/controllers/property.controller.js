const propertyService = require("../services/property.service");
const fs = require("fs");
const path = require("path");

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
Add one renter to a property by email.
*/
async function addRenterToProperty(req, res) {
    const { propertyId } = req.params;
    const { renterEmail } = req.body;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    if (!renterEmail || !renterEmail.trim()) {
        return res.status(400).json({
            success: false,
            message: "Renter email is required."
        });
    }

    const result = await propertyService.addRenterToProperty(
        propertyId,
        renterEmail
    );

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Remove one renter from a property by renter user id.
*/
async function removeRenterFromProperty(req, res) {
    const { propertyId } = req.params;
    const { renterId } = req.body;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    if (!renterId) {
        return res.status(400).json({
            success: false,
            message: "Renter id is required."
        });
    }

    const result = await propertyService.removeRenterFromProperty(
        propertyId,
        renterId
    );

    return res.status(result.success ? 200 : 400).json(result);
}
/*
Upload or replace a property contract.
*/
async function uploadContractToProperty(req, res) {
    const { propertyId } = req.params;
    const { uploadedBy } = req.body;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "A PDF contract file is required."
        });
    }

    const decodedOriginalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");
    const contractFileUrl = req.file.filename;

    const result = await propertyService.uploadContractToProperty(propertyId, {
        contractFileName: decodedOriginalName,
        contractFileUrl,
        contractUploadedBy: uploadedBy || "Unknown"
    });

    return res.status(result.success ? 200 : 400).json(result);
}

/*
View a property contract through a protected backend route.
*/
async function viewPropertyContract(req, res) {
    const { propertyId } = req.params;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    const result = await propertyService.getPropertyById(propertyId);

    if (!result.success || !result.property) {
        return res.status(404).json({
            success: false,
            message: "Property not found."
        });
    }

    const property = result.property;

    if (!property.contractFileUrl) {
        return res.status(404).json({
            success: false,
            message: "No contract was found for this property."
        });
    }

    const storedFileName = property.contractFileUrl.includes("/")
        ? property.contractFileUrl.split("/").pop()
        : property.contractFileUrl;

    const contractPath = path.join(__dirname, "..", "..", "uploads", "contracts", storedFileName);

    if (!fs.existsSync(contractPath)) {
        return res.status(404).json({
            success: false,
            message: "Contract file was not found on the server."
        });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `inline; filename="${property.contractFileName || "contract.pdf"}"`
    );

    return res.sendFile(contractPath);
}

/*
Get all properties linked to one renter.
*/
async function getRenterProperties(req, res) {
    const { renterId } = req.params;

    if (!renterId) {
        return res.status(400).json({
            success: false,
            message: "Renter id is required."
        });
    }

    const result = await propertyService.getRenterProperties(renterId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Link a renter to a property using a renter join code.
*/
async function joinPropertyByCode(req, res) {
    const { renterId, renterJoinCode } = req.body;

    if (!renterId || !renterJoinCode) {
        return res.status(400).json({
            success: false,
            message: "Renter id and join code are required."
        });
    }

    const result = await propertyService.joinPropertyByCode(
        renterId,
        renterJoinCode
    );

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    createProperty,
    getHomeownerProperties,
    getPropertyById,
    addRenterToProperty,
    removeRenterFromProperty,
    uploadContractToProperty,
    viewPropertyContract,
    getRenterProperties,
    joinPropertyByCode
};