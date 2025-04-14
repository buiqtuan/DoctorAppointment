/**
 * Doctor model schema definition
 */
const mongoose = require("mongoose");

/**
 * Doctor schema
 * Defines the structure for doctor documents in MongoDB
 */
const doctorSchema = mongoose.Schema(
  {
    // Reference to the associated User document
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Doctor's medical specialization
    specialization: {
      type: String,
      required: true,
      trim: true, // Removes whitespace from both ends
    },
    
    // Years of professional experience
    experience: {
      type: Number,
      required: true,
      min: 0, // Experience cannot be negative
    },
    
    // Consultation fees
    fees: {
      type: Number,
      required: true,
      min: 0, // Fees cannot be negative
    },
    
    // Flag to identify verified doctors
    isDoctor: {
      type: Boolean,
      default: false, // Not verified by default
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create model from schema
const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
