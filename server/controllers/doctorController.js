const {
  User,
  Doctor,
  Notification,
  Appointment,
  Specification,
  DoctorSpecification,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const searchDoctors = async (req, res) => {
  try {
    const { specifications, minExperience, minFees, maxFees } = req.query;

    // Base query to find active doctors
    const whereClause = { isDoctor: true };

    // Exclude requesting doctor from results if logged in
    if (req.locals) {
      whereClause.id = { [Op.ne]: req.locals };
    }

    // Add experience filter
    if (minExperience && !isNaN(minExperience)) {
      whereClause.experience = { [Op.gte]: parseInt(minExperience) };
    }

    // Add fees filter
    if (minFees && !isNaN(minFees) && maxFees && !isNaN(maxFees)) {
      whereClause.fees = {
        [Op.between]: [parseFloat(minFees), parseFloat(maxFees)],
      };
    } else if (minFees && !isNaN(minFees)) {
      whereClause.fees = { [Op.gte]: parseFloat(minFees) };
    } else if (maxFees && !isNaN(maxFees)) {
      whereClause.fees = { [Op.lte]: parseFloat(maxFees) };
    }

    const includeOptions = [
      {
        model: User,
        as: "user",
      },
      {
        model: Specification,
        as: "specializations",
        through: { attributes: [] },
        where: { isDeleted: false },
        required: false,
      },
    ];

    // Add specification filter if provided
    if (specifications) {
      const specIds = specifications
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
      if (specIds.length > 0) {
        includeOptions[1].where = {
          ...includeOptions[1].where,
          id: { [Op.in]: specIds },
        };
        includeOptions[1].required = true; // Make it required to filter doctors
      }
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: includeOptions,
    });

    return res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    console.error("Error searching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Unable to search doctors",
      error: error.message,
    });
  }
};

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
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] }, // Exclude junction table attributes
          where: { isDeleted: false },
          required: false,
        },
      ],
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
        userId: { [Op.ne]: req.locals },
      },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] }, // Exclude junction table attributes
          where: { isDeleted: false },
          required: false,
        },
      ],
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
      where: { userId: req.locals },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Application already exists",
      });
    }

    // Handle both nested and direct data structures
    const formData = req.body.formDetails || req.body;
    const { experience, fees, specializations } = formData;

    // Validate required fields
    if (!experience || !fees) {
      return res.status(400).json({
        success: false,
        message: "Experience and fees are required",
      });
    }

    // Validate specializations
    if (
      !specializations ||
      !Array.isArray(specializations) ||
      specializations.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one specialization is required",
      });
    }

    // Get the first specialization name for the main specialization field
    const primarySpecification = await Specification.findByPk(
      specializations[0]
    );
    if (!primarySpecification) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization selected",
      });
    }

    // Create new doctor application
    const doctor = await Doctor.create({
      experience,
      fees,
      specialization: primarySpecification.name, // Set the primary specialization
      userId: req.locals,
    });

    // Add all specializations to the junction table
    const specificationRecords = specializations.map((specId) => ({
      doctorId: doctor.id,
      specificationId: specId,
    }));

    await DoctorSpecification.bulkCreate(specificationRecords);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      success: false,
      message: "Unable to submit application",
      error: error.message,
    });
  }
};

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
        params: req.params,
      });
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if doctor application exists
    const doctorApplication = await Doctor.findOne({ where: { userId } });
    if (!doctorApplication) {
      return res.status(404).json({
        success: false,
        message: "Doctor application not found",
      });
    }

    // Update user record
    await User.update(
      { isDoctor: true, status: "accepted" },
      { where: { id: userId } }
    );

    // Update doctor record
    await Doctor.update({ isDoctor: true }, { where: { userId } });

    // Create and send notification
    await Notification.create({
      userId,
      content: `Congratulations, Your application has been accepted.`,
    });

    return res.status(200).json({
      success: true,
      message: "Application accepted notification sent",
    });
  } catch (error) {
    console.error("Error accepting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error while sending notification",
      error: error.message,
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
        params: req.params,
      });
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the doctor record to get doctorId for cleanup
    const doctor = await Doctor.findOne({ where: { userId } });

    if (doctor) {
      // Clean up doctor specializations first
      await DoctorSpecification.destroy({ where: { doctorId: doctor.id } });
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
      message: "Application rejection notification sent",
    });
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error while rejecting application",
      error: error.message,
    });
  }
};

/**
 * Remove doctor status and clean up related records
 */
const deletedoctor = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the doctor record first to get the doctorId
    const doctor = await Doctor.findOne({ where: { userId } });

    if (doctor) {
      // Delete doctor specializations, doctor record and appointments in parallel
      await Promise.all([
        DoctorSpecification.destroy({ where: { doctorId: doctor.id } }),
        Doctor.destroy({ where: { userId } }),
        Appointment.destroy({ where: { userId } }),
      ]);
    }

    // Update user record
    await User.update({ isDoctor: false }, { where: { id: userId } });

    return res.status(200).send("Doctor deleted successfully");
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).send("Unable to delete doctor");
  }
};

/**
 * Get top doctors with most booked appointments
 */
const getTopDoctors = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    // First, get appointment counts for all doctors
    const appointmentCounts = await Appointment.findAll({
      attributes: [
        "doctorId",
        [sequelize.fn("COUNT", sequelize.col("id")), "appointmentCount"],
      ],
      group: ["doctorId"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: parseInt(limit),
      raw: true,
    });

    if (appointmentCounts.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Get the doctor IDs and their counts
    const doctorIds = appointmentCounts.map((item) => item.doctorId);
    const countMap = {};
    appointmentCounts.forEach((item) => {
      countMap[item.doctorId] = parseInt(item.appointmentCount);
    });

    // Get full doctor details
    const topDoctors = await Doctor.findAll({
      where: {
        isDoctor: true,
        userId: { [Op.in]: doctorIds },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstname", "lastname", "email", "mobile", "pic"],
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] },
          where: { isDeleted: false },
          required: false,
        },
      ],
    });

    // Add appointment counts and format specializations
    const doctorsWithCounts = topDoctors.map((doctor) => {
      const doctorData = doctor.toJSON();

      // Format specializations for consistent frontend usage
      const specializationNames =
        doctorData.specializations && doctorData.specializations.length > 0
          ? doctorData.specializations.map((spec) => spec.name).join(", ")
          : doctorData.specialization || "Not specified";

      return {
        ...doctorData,
        appointmentCount: countMap[doctor.userId] || 0,
        // Keep both for backward compatibility
        specialization: specializationNames,
        formattedSpecializations: specializationNames,
      };
    });

    // Sort by appointment count (descending)
    doctorsWithCounts.sort((a, b) => b.appointmentCount - a.appointmentCount);

    return res.status(200).json({
      success: true,
      data: doctorsWithCounts.slice(0, parseInt(limit)),
      count: doctorsWithCounts.length,
    });
  } catch (error) {
    console.error("Error fetching top doctors:", error);
    res.status(500).json({
      success: false,
      message: "Unable to get top doctors",
      error: error.message,
    });
  }
};

module.exports = {
  getalldoctors,
  getnotdoctors,
  deletedoctor,
  applyfordoctor,
  acceptdoctor,
  rejectdoctor,
  searchDoctors,
  getTopDoctors,
};
