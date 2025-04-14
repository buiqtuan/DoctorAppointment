/**
 * Google Authentication User Schema
 * This module defines the data structure for users authenticated via Google OAuth
 */
const mongoose = require("mongoose");

// Define the schema with proper validation and indexing
const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    image: {
        type: String,
        default: null
    }
}, { 
    timestamps: true 
});

// Create the model using the schema
const Guser = mongoose.model("GUser", userSchema);

// Export the model
module.exports = Guser;