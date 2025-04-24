const mongoose = require("mongoose");

/**
 * Notification Schema
 * Represents a notification entity in the system
 */
const notificationSchema = mongoose.Schema(
  {
    // Reference to the user who receives this notification
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Corrected SchemaTypes to Schema.Types
      ref: "User",
      required: true,
      index: true // Added index for better query performance
    },
    
    // Tracks whether the notification has been read by the user
    isRead: {
      type: Boolean,
      default: false,
      index: true // Added index for filtering by read/unread status
    },
    
    // The actual message content of the notification
    content: {
      type: String,
      required: true, // Changed from default empty to required
      trim: true // Added trim to remove whitespace
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false // Removes the __v field from documents
  }
);

// Create and export the Notification model
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
