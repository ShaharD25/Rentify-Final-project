// health.controller.js
// Handles HTTP requests for the health endpoint.

const { getHealthStatus } = require("../services/health.service");

// Returns the health status response
function health(req, res) {
  const data = getHealthStatus();
  res.json(data);
}

module.exports = { health };
