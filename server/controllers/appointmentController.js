const { User, Appointment, Notification, Doctor } = require("../models");

/**
 * Get all appointments for a specific user or doctor
 * @param {Object} req - Request with user ID
 * @param {Object} res - Response object
 */
const getallappointments = async (req, res) => {
  try {
    // Find the current user
    const user = await User.findByPk(req.locals);
    
    // If user not found
    if (!user) {
      return res.status(404).send("User not found");
    }

    let appointments;
    
    // If user is a doctor, get appointments where doctorId matches user's ID
    if (user.isDoctor) {
      appointments = await Appointment.findAll({
        where: { doctorId: req.locals },
        include: [
          { model: User, as: 'patient', attributes: ['firstname', 'lastname', 'email', 'mobile', 'pic'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // If user is a patient, get appointments where userId matches user's ID
      appointments = await Appointment.findAll({
        where: { userId: req.locals },
        include: [
          { model: User, as: 'doctor', attributes: ['firstname', 'lastname', 'email', 'mobile', 'pic'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    return res.status(200).send(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Unable to get appointments");
  }
};

/**
 * Book a new appointment and send notifications
 * @param {Object} req - Request with appointment details
 * @param {Object} res - Response object
 */
const bookappointment = async (req, res) => {
  try {
    // Find the user and doctor
    const user = await User.findByPk(req.locals);
    const doctor = await User.findByPk(req.body.doctorId);
    
    if (!user || !doctor) {
      return res.status(404).send("User or doctor not found");
    }

    // Create the appointment
    const appointment = await Appointment.create({
      userId: req.locals,
      doctorId: req.body.doctorId,
      date: req.body.date,
      time: req.body.time,
      age: user.age || req.body.age,
      gender: user.gender || req.body.gender,
      bloodGroup: user.bloodGroup || req.body.bloodGroup,
      number: user.mobile || req.body.number,
      familyDiseases: req.body.familyDiseases || '',
      status: "Pending"
    });

    // Create notifications in parallel
    await Promise.all([
      // Notification for doctor
      Notification.create({
        userId: req.body.doctorId,
        content: `You have an appointment with ${user.firstname} ${user.lastname} on ${req.body.date} at ${req.body.time} Age: ${user.age} bloodGroup: ${user.bloodGroup} Gender: ${user.gender} Mobile Number: ${user.mobile} Family Diseases: ${user.familyDiseases}`,
      }),
      
      // No need to wait for appointment creation as it's already created above
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
    await Appointment.update(
      { status: "Completed" },
      { where: { id: req.body.appointid } }
    );

    // Get user data for notification
    const user = await User.findByPk(req.locals);
    
    // Create notifications in parallel
    await Promise.all([
      // Create notification for the user
      Notification.create({
        userId: req.locals,
        content: `Your appointment with ${req.body.doctorname} has been completed`,
      }),
      
      // Create notification for the doctor
      Notification.create({
        userId: req.body.doctorId,
        content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
      })
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