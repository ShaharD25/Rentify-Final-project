const roommateService = require("../services/roommate.service");

/*
Get all roommates for one apartment.
*/
async function getApartmentRoommates(req, res) {
    const { propertyId } = req.params;
    const { renterId } = req.query;

    if (!propertyId || !renterId) {
        return res.status(400).json({
            success: false,
            message: "Property id and renter id are required."
        });
    }

    const result = await roommateService.getApartmentRoommates(propertyId, renterId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Generate a join code for one apartment.
*/
async function generateApartmentJoinCode(req, res) {
    const { propertyId } = req.params;
    const { renterId } = req.body;

    if (!propertyId || !renterId) {
        return res.status(400).json({
            success: false,
            message: "Property id and renter id are required."
        });
    }

    const result = await roommateService.generateApartmentJoinCode(propertyId, renterId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Join an apartment using a join code.
*/
async function joinApartmentByCode(req, res) {
    const { renterId, renterJoinCode } = req.body;

    if (!renterId || !renterJoinCode) {
        return res.status(400).json({
            success: false,
            message: "Renter id and join code are required."
        });
    }

    const result = await roommateService.joinApartmentByCode(
        renterId,
        renterJoinCode
    );

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    getApartmentRoommates,
    generateApartmentJoinCode,
    joinApartmentByCode
};