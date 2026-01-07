// app.js
// Main entry point of the backend application.
// Sets up the Express server, global middlewares, routes and error handling.

const express = require("express");
const logger = require("./middlewares/logger.middleware");
const errorHandler = require("./middlewares/error.middleware");

const healthRoutes = require("./routes/health.routes");

const app = express();

// Parse JSON bodies from incoming requests
app.use(express.json());

// Log every incoming request
app.use(logger);

// Register API routes
app.use("/api", healthRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
