// app.js
// Main entry point of the backend application.
// Sets up the Express server, global middlewares, routes and error handling.

const express = require("express");
const cors = require("cors");
const path = require("path");
// load environment variables:
const dotenv = require("dotenv");
// database connection:
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Middlewares
const logger = require("./middlewares/logger.middleware");
const errorHandler = require("./middlewares/error.middleware");

// Routes
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const issueRoutes = require("./routes/issue.routes");
const paymentRoutes = require("./routes/payment.routes");
const notificationRoutes = require("./routes/notification.routes");


const app = express();

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON bodies from incoming requests
app.use(express.json());


// Serve uploaded issue images.
app.use("/uploads/issues", express.static(path.join(__dirname, "..", "uploads", "issues")));

// Log every incoming request
app.use(logger);

// Register API routes
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", propertyRoutes);
app.use("/api", issueRoutes);
app.use("/api", paymentRoutes);
app.use("/api", notificationRoutes);

// Global error handler (must be after routes)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});