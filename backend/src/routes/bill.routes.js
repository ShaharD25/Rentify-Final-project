const express = require("express");
const router = express.Router();

const {
    getApartmentBills,
    createApartmentBill
} = require("../controllers/bill.controller");

/*
Get bills for one apartment.
GET /api/bills/property/:propertyId?renterId=...
*/
router.get("/bills/property/:propertyId", getApartmentBills);

/*
Create a new bill for one apartment.
POST /api/bills/property/:propertyId
*/
router.post("/bills/property/:propertyId", createApartmentBill);

module.exports = router;