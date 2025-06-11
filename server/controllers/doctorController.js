const { User, Doctor, Notification, Appointment } = require("../models");
const { Op } = require("sequelize");

/**
 * Get all doctors with isDoctor status true
 * Excludes the requesting doctor if they are making the request
 */
const getalldoctors = async (req, res) => {
  try {
    // Base query to find active doctors
    const whereClause = { isDoctor: true };
    
    // Exclude requesting doctor from results if logged in
    if (req.locals) {
      whereClause.id = { [Op.ne]: req.locals };
    }
    
    const docs = await Doctor.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user' }]
    });
    
    return res.status(200).send(docs);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).send("Unable to get doctors");
  }
};

/**
 * Get all users who have applied but aren't approved as doctors yet
 */
const getnotdoctors = async (req, res) => {
  try {
    const docs = await Doctor.findAll({
      where: {
        isDoctor: false,
        userId: { [Op.ne]: req.locals }
      },
      include: [{ model: User, as: 'user' }]
    });

    return res.status(200).send(docs);
  } catch (error) {
    console.error("Error fetching non-doctors:", error);
    res.status(500).send("Unable to get non doctors");
  }
};

/**
 * Handle doctor application submission
 */
const applyfordoctor = async (req, res) => {
  try {
    // Check if user already has an application
    const existingApplication = await Doctor.findOne({ 
      where: { userId: req.locals }
    });
    
    if (existingApplication) {
      return res.status(400).send("Application already exists");
    }

    // Create and save new doctor application
    await Doctor.create({ 
      ...req.body.formDetails, 
      userId: req.locals 
    });

    return res.status(201).send("Application submitted successfully");
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).send("Unable to submit application");
  }
};

/**
 * Accept a doctor application and notify the user
 */
/**
 * Accept a doctor application and notify the user
 */
const acceptdoctor = async (req, res) => {
  try {
    // Try to get userId from different possible sources
    const userId = req.body.id || req.body.userId || req.params.id;

    // Validate that we have a userId
    if (!userId) {
      console.error("No userId provided in request:", {
        body: req.body,
        params: req.params
      });
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if doctor application exists
    const doctorApplication = await Doctor.findOne({ where: { userId } });
    if (!doctorApplication) {
      return res.status(404).json({
        success: false,
        message: "Doctor application not found"
      });
    }

    // Update user record
    await User.update(
      { isDoctor: true, status: "accepted" },
      { where: { id: userId } }
    );

    // Update doctor record
    await Doctor.update(
      { isDoctor: true },
      { where: { userId } }
    );

    // Create and send notification
    await Notification.create({
      userId,
      content: `Congratulations, Your application has been accepted.`,
    });

    return res.status(200).json({
      success: true,
      message: "Application accepted notification sent"
    });
  } catch (error) {
    console.error("Error accepting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error while sending notification",
      error: error.message
    });
  }
};

/**
 * Reject a doctor application and notify the user
 */
const rejectdoctor = async (req, res) => {
  try {
    // Try to get userId from different possible sources
    const userId = req.body.id || req.body.userId || req.params.id;
    
    // Validate that we have a userId
    if (!userId) {
      console.error("No userId provided in request:", {
        body: req.body,
        params: req.params
      });
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update user status
    await User.update(
      { isDoctor: false, status: "rejected" },
      { where: { id: userId } }
    );
    
    // Remove doctor application
    await Doctor.destroy({ where: { userId } });

    // Create and send rejection notification
    await Notification.create({
      userId,
      content: `Sorry, Your application has been rejected.`,
    });

    return res.status(200).json({
      success: true,
      message: "Application rejection notification sent"
    });
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error while rejecting application",
      error: error.message
    });
  }
};

/**
 * Remove doctor status and clean up related records
 */
const deletedoctor = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Update user record
    await User.update(
      { isDoctor: false },
      { where: { id: userId } }
    );
    
    // Delete doctor record and any appointments in parallel
    await Promise.all([
      Doctor.destroy({ where: { userId } }),
      Appointment.destroy({ where: { userId } })
    ]);
    
    return res.status(200).send("Doctor deleted successfully");
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).send("Unable to delete doctor");
  }
};

module.exports = {
  getalldoctors,
  getnotdoctors,
  deletedoctor,
  applyfordoctor,
  acceptdoctor,
  rejectdoctor,
};