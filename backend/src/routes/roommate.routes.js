const express = require("express");
const router = express.Router();

const {
    getApartmentRoommates,
    generateApartmentJoinCode,
    joinApartmentByCode
} = require("../controllers/roommate.controller");

/*
Get roommates for one apartment.
GET /api/roommates/property/:propertyId?renterId=...
*/
router.get("/roommates/property/:propertyId", getApartmentRoommates);

/*
Generate join code for one apartment.
POST /api/roommates/property/:propertyId/join-code
*/
router.post("/roommates/property/:propertyId/join-code", generateApartmentJoinCode);

/*
Join apartment using join code.
POST /api/roommates/join
*/
router.post("/roommates/join", joinApartmentByCode);

module.exports = router;