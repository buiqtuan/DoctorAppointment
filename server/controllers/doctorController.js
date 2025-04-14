const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Appointment = require("../models/appointmentModel");

/**
 * Get all doctors with isDoctor status true
 * Excludes the requesting doctor if they are making the request
 */
const getalldoctors = async (req, res) => {
  try {
    // Base query to find active doctors
    const query = { isDoctor: true };
    
    // Exclude requesting doctor from results if logged in
    if (req.locals) {
      query._id = { $ne: req.locals };
    }
    
    const docs = await Doctor.find(query).populate("userId");
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
    const docs = await Doctor.find({
      isDoctor: false,
      _id: { $ne: req.locals }
    }).populate("userId");

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
    const existingApplication = await Doctor.findOne({ userId: req.locals });
    if (existingApplication) {
      return res.status(400).send("Application already exists");
    }

    // Create and save new doctor application
    const doctor = new Doctor({ 
      ...req.body.formDetails, 
      userId: req.locals 
    });
    await doctor.save();

    return res.status(201).send("Application submitted successfully");
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).send("Unable to submit application");
  }
};

/**
 * Accept a doctor application and notify the user
 */
const acceptdoctor = async (req, res) => {
  try {
    const userId = req.body.id;

    // Update user record
    await User.findByIdAndUpdate(userId, {
      isDoctor: true, 
      status: "accepted" 
    });

    // Update doctor record
    await Doctor.findOneAndUpdate(
      { userId }, 
      { isDoctor: true }
    );

    // Create and send notification
    const notification = new Notification({
      userId,
      content: `Congratulations, Your application has been accepted.`,
    });
    await notification.save();

    return res.status(201).send("Application accepted notification sent");
  } catch (error) {
    console.error("Error accepting doctor:", error);
    res.status(500).send("Error while sending notification");
  }
};

/**
 * Reject a doctor application and notify the user
 */
const rejectdoctor = async (req, res) => {
  try {
    const userId = req.body.id;
    
    // Update user status
    await User.findByIdAndUpdate(userId, {
      isDoctor: false, 
      status: "rejected" 
    });
    
    // Remove doctor application
    await Doctor.findOneAndDelete({ userId });

    // Create and send rejection notification
    const notification = new Notification({
      userId,
      content: `Sorry, Your application has been rejected.`,
    });
    await notification.save();

    return res.status(201).send("Application rejection notification sent");
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    res.status(500).send("Error while rejecting application");
  }
};

/**
 * Remove doctor status and clean up related records
 */
const deletedoctor = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Update user record
    await User.findByIdAndUpdate(userId, { isDoctor: false });
    
    // Delete doctor record and any appointments
    await Promise.all([
      Doctor.findOneAndDelete({ userId }),
      Appointment.findOneAndDelete({ userId })
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
