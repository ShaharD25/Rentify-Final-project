// health.routes.js
// Defines routes related to the health endpoint.

const express = require("express");
const { health } = require("../controllers/health.controller");
const healthCheck = require("../middlewares/healthCheck.middleware");

const router = express.Router();

// Health check route
router.get("/health", healthCheck, health);

module.exports = router;
