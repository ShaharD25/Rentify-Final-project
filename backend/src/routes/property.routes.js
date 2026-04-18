const express = require("express");
const router = express.Router();

const {
  createProperty,
  getHomeownerProperties,
  getPropertyById,
  addRenterToProperty
} = require("../controllers/property.controller");

/*
Create property route
POST /api/properties
*/
router.post("/properties", createProperty);

/*
Get all properties for one homeowner
GET /api/properties/homeowner/:homeownerId
*/
router.get("/properties/homeowner/:homeownerId", getHomeownerProperties);

/*
Get one property by id
GET /api/properties/:propertyId
*/
router.get("/properties/:propertyId", getPropertyById);

/*
Add one renter to a property
PUT /api/properties/:propertyId/renters
*/
router.put("/properties/:propertyId/renters", addRenterToProperty);
module.exports = router;