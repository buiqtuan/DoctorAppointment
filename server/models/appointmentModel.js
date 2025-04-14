const mongoose = require("mongoose");

/**
 * Appointment Schema
 * Stores details about doctor appointments including patient information,
 * scheduling details, and appointment status
 */
const appointmentSchema = new mongoose.Schema(
  {
    // Reference to the patient user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the doctor user
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Appointment date
    date: {
      type: String,
      required: true,
    },
    // Appointment time
    time: {
      type: String,
      required: true,
    },
    // Patient age
    age: {
      type: Number,
      required: true,
    },
    // Patient blood group (optional)
    bloodGroup: {
      type: String,
      required: false,
    },
    // Patient gender
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    // Contact number
    number: {
      type: Number,
      required: true,
    },
    // Family medical history (optional)
    familyDiseases: {
      type: String,
      required: false,
    },
    // Appointment status (defaults to Pending)
    status: {
      type: String,
      default: "Pending",
    },
    // Prescription field is commented out for future implementation
    // prescription: {
    //   type: String,
    //   required: false,
    // },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the model using the schema
const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
