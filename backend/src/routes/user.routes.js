const express = require("express");
const router = express.Router();

const {
    getUserProfile,
    updateUserProfile
} = require("../controllers/user.controller");

/*
Get user profile.
GET /api/users/:userId/profile
*/
router.get("/users/:userId/profile", getUserProfile);

/*
Update user profile.
PUT /api/users/:userId/profile
*/
router.put("/users/:userId/profile", updateUserProfile);

module.exports = router;