// logger.middleware.js
// Logs every incoming HTTP request.

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

module.exports = logger;
