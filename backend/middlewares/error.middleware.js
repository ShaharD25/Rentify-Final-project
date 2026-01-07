// error.middleware.js
// Handles errors thrown in the application.

function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(500).json({
    message: "Something went wrong",
  });
}

module.exports = errorHandler;
