const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

/**
 * Get all appointments with optional filtering
 * @param {Object} req - Request object with optional search query
 * @param {Object} res - Response object
 */
const getallappointments = async (req, res) => {
  try {
    // Create search filter if search query exists
    const keyword = req.query.search
      ? {
          $or: [{ userId: req.query.search }, { doctorId: req.query.search }],
        }
      : {};

    // Find appointments and populate related doctor and user data
    const appointments = await Appointment.find(keyword)
      .populate("doctorId")
      .populate("userId");
    
    return res.send(appointments);
  } catch (error) {
    console.error("Error getting appointments:", error);
    res.status(500).send("Unable to get appointments");
  }
};

/**
 * Book a new appointment and create notifications
 * @param {Object} req - Request with appointment details
 * @param {Object} res - Response object
 */
const bookappointment = async (req, res) => {
  try {
    // Create new appointment object
    const appointment = new Appointment({
      date: req.body.date,
      time: req.body.time,
      age: req.body.age,
      bloodGroup: req.body.bloodGroup,
      gender: req.body.gender,
      number: req.body.number,
      familyDiseases: req.body.familyDiseases,
      doctorId: req.body.doctorId,
      userId: req.locals,
    });

    // Get user data for notification
    const user = await User.findById(req.locals);
    
    // Create notifications in parallel
    await Promise.all([
      // Create notification for the user
      new Notification({
        userId: req.locals,
        content: `You booked an appointment with Dr. ${req.body.doctorname} for ${req.body.date} ${req.body.time}`,
      }).save(),
      
      // Create notification for the doctor
      new Notification({
        userId: req.body.doctorId,
        content: `You have an appointment with ${user.firstname} ${user.lastname} on ${req.body.date} at ${req.body.time} Age: ${user.age} bloodGropu: ${user.bloodGroup} Gender: ${user.gender} Mobile Number:${user.number} Family Diseases ${user.familyDiseases}`,
      }).save(),
      
      // Save the appointment
      appointment.save()
    ]);

    return res.status(201).send(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send("Unable to book appointment");
  }
};

/**
 * Mark an appointment as completed and notify participants
 * @param {Object} req - Request with appointment details
 * @param {Object} res - Response object
 */
const completed = async (req, res) => {
  try {
    // Update appointment status to completed
    await Appointment.findOneAndUpdate(
      { _id: req.body.appointid },
      { status: "Completed" }
    );

    // Get user data for notification
    const user = await User.findById(req.locals);
    
    // Create notifications in parallel
    await Promise.all([
      // Create notification for the user
      new Notification({
        userId: req.locals,
        content: `Your appointment with ${req.body.doctorname} has been completed`,
      }).save(),
      
      // Create notification for the doctor
      new Notification({
        userId: req.body.doctorId,
        content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
      }).save()
    ]);

    return res.status(201).send("Appointment completed");
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).send("Unable to complete appointment");
  }
};

module.exports = {
  getallappointments,
  bookappointment,
  completed,
};
