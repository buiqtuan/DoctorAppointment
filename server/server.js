// Import required modules
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

// Database connection
require("./db/conn");

// Socket controller
require("./controllers/socket");

// Import route handlers
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const notificationRouter = require("./routes/notificationRoutes");

// Initialize Express application
const app = express();

// Set port from environment variables or use default
const port = process.env.PORT || 5015;

// Middleware setup
app.use(cors());                 // Enable CORS for all routes
app.use(express.json());         // Parse JSON request bodies

// API Routes
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, "./client/build")));

// Handle all other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
