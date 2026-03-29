// auth.routes.js
// Defines authentication-related API routes
console.log("AUTH ROUTES FILE LOADED - V2");

const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth.controller");

/*
Signup route
POST /api/auth/signup
*/
router.post("/auth/signup", signup);

/*
Login route
POST /api/auth/login
*/
router.post("/auth/login", login);

module.exports = router;
