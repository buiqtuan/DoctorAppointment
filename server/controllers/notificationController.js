const Notification = require("../models/notificationModel");

/**
 * Get all notifications for a user
 * @param {Object} req - Express request object containing user ID in locals
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with notifications or error message
 */
const getallnotifs = async (req, res) => {
  try {
    // Extract user ID from request locals
    const userId = req.locals;
    
    // Find all notifications for this user
    const notifications = await Notification.find({ userId });
    
    // Return notifications as JSON response
    return res.status(200).json(notifications);
  } catch (error) {
    // Log error details for debugging
    console.error("Error fetching notifications:", error);
    
    // Send appropriate error response
    return res.status(500).json({ 
      message: "Unable to get all notifications",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getallnotifs,
};
