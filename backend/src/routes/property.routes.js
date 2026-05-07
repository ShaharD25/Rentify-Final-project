const express = require("express");
const router = express.Router();

const uploadContract = require("../middlewares/uploadContract.middleware");

const {
  createProperty,
  getHomeownerProperties,
  getPropertyById,
  addRenterToProperty,
  removeRenterFromProperty,
  uploadContractToProperty,
  viewPropertyContract,
  getRenterProperties,
  joinPropertyByCode
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
Get all properties for one renter
GET /api/properties/renter/:renterId
*/
router.get("/properties/renter/:renterId", getRenterProperties);

/*
Join a property by renter join code
PUT /api/properties/join-by-code
*/
router.put("/properties/join-by-code", joinPropertyByCode);

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

/*
Remove one renter from a property
PUT /api/properties/:propertyId/renters/remove
*/
router.put("/properties/:propertyId/renters/remove", removeRenterFromProperty);

/*
Upload or replace a property contract
PUT /api/properties/:propertyId/contract
*/
router.put(
  "/properties/:propertyId/contract",
  uploadContract.single("contractFile"),
  uploadContractToProperty
);

/*
View a property contract through the backend
GET /api/properties/:propertyId/contract/view
*/
router.get("/properties/:propertyId/contract/view", viewPropertyContract);

module.exports = router;