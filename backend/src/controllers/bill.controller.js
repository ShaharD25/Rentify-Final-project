const billService = require("../services/bill.service");

/*
Get all bills for one apartment.
*/
async function getApartmentBills(req, res) {
    const { propertyId } = req.params;
    const { renterId } = req.query;

    if (!propertyId || !renterId) {
        return res.status(400).json({
            success: false,
            message: "Property id and renter id are required."
        });
    }

    const result = await billService.getApartmentBills(propertyId, renterId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Create a new apartment bill.
*/
async function createApartmentBill(req, res) {
    const { propertyId } = req.params;
    const {
        renterId,
        amount,
        dueDate,
        category,
        description
    } = req.body;

    if (!propertyId || !renterId || !amount || !dueDate || !category) {
        return res.status(400).json({
            success: false,
            message: "Property id, renter id, amount, due date, and category are required."
        });
    }

    const result = await billService.createApartmentBill({
        propertyId,
        renterId,
        amount,
        dueDate,
        category,
        description
    });

    return res.status(result.success ? 201 : 400).json(result);
}

module.exports = {
    getApartmentBills,
    createApartmentBill
};