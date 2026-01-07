// health.service.js
// Contains the logic for the health check.

function getHealthStatus() {
  return { status: "ok" };
}

module.exports = { getHealthStatus };
