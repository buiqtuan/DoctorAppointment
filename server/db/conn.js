/**
 * Database connection module using MongoDB and Mongoose
 */
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb"); // This import is maintained for compatibility but not used

// Configure mongoose to avoid deprecation warnings
mongoose.set("strictQuery", false);

// Load environment variables from .env file
require("dotenv").config();

/**
 * Establish MongoDB connection using Mongoose
 * The connection promise is stored in client and exported
 */
const client = mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    // Add recommended options for better stability and performance
    useUnifiedTopology: true,
    autoIndex: true, // Build indexes
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s default
  })
  .then(() => {
    console.log("Database connection established successfully");
    return mongoose.connection; // Return the connection for potential further use
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    // Re-throw the error to allow proper handling by the application
    throw error;
  });

module.exports = client;
