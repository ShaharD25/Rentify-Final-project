// healthCheck.middleware.js
// Middleware used only for the health route.

function healthCheck(req, res, next) {
  console.log("Health check middleware");
  next();
}

module.exports = healthCheck;
