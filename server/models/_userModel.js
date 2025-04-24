/**
 * User Model Schema Definition
 * Defines the structure for User documents in MongoDB
 */
const mongoose = require("mongoose");

// Define the User schema with validation rules
const userSchema = mongoose.Schema(
  {
    // Personal information
    firstname: {
      type: String,
      required: true,
      minLength: 3,
      trim: true // Added trim to remove whitespace
    },
    lastname: {
      type: String,
      required: true,
      minLength: 3,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true // Ensures email is stored in lowercase
    },
    password: {
      type: String,
      required: true,
      minLength: 5
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Doctor", "Patient"]
    },
    
    // Optional user details with default values
    age: {
      type: Number,
      default: null // Changed empty string to null for proper typing
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""], // Added enum for standardization
      default: ""
    },
    mobile: {
      type: String, // Changed to String to handle country codes and formatting
      default: ""
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      default: "",
      trim: true
    },
    pic: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false // Removes the __v field from documents
  }
);

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
