const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Salt rounds for bcrypt password hashing
const SALT_ROUNDS = 10;

/**
 * Get a single user by ID
 * @param {Object} req - Request object with user ID in params
 * @param {Object} res - Response object
 */
const getuser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).send("User not found");
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Unable to get user");
  }
};

/**
 * Get all users except the current user
 * @param {Object} req - Request object with locals containing current user ID
 * @param {Object} res - Response object
 */
const getallusers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.locals } }).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).send("Unable to get all users");
  }
};

/**
 * Authenticate a user
 * @param {Object} req - Request object with email, password, and role
 * @param {Object} res - Response object
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Incorrect credentials");
    }
    
    // Verify role
    if (user.role !== role) {
      return res.status(404).send("Role does not exist");
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send("Incorrect credentials");
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2 days" }
    );
    
    return res.status(201).json({ msg: "User logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Unable to login user");
  }
};

/**
 * Register a new user
 * @param {Object} req - Request object with user details
 * @param {Object} res - Response object
 */
const register = async (req, res) => {
  try {
    // Check if email already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).send("Email already exists");
    }
    
    // Hash password and create new user
    const hashedPass = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const user = new User({ ...req.body, password: hashedPass });
    
    await user.save();
    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Unable to register user");
  }
};

/**
 * Update user profile
 * @param {Object} req - Request object with updated user details
 * @param {Object} res - Response object
 */
const updateprofile = async (req, res) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const result = await User.findByIdAndUpdate(
      req.locals,
      { ...req.body, password: hashedPass },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).send("User not found");
    }
    
    return res.status(200).send("User updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).send("Unable to update user");
  }
};

/**
 * Change user password
 * @param {Object} req - Request object with user ID, current password, new password
 * @param {Object} res - Response object
 */
const changepassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Validate password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send("Passwords do not match");
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    // Verify current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).send("Incorrect current password");
    }
    
    // Update password
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
    
    return res.status(200).send("Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * Delete a user and related records
 * @param {Object} req - Request object with user ID
 * @param {Object} res - Response object
 */
const deleteuser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Delete user and related records in a transaction-like approach
    await Promise.all([
      User.findByIdAndDelete(userId),
      Doctor.findOneAndDelete({ userId }),
      Appointment.findOneAndDelete({ userId })
    ]);
    
    return res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).send("Unable to delete user");
  }
};

/**
 * Send password reset email
 * @param {Object} req - Request object with user email
 * @param {Object} res - Response object
 */
const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }
    
    // Generate reset token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1m" });
    
    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tarun.kumar.csbs25@heritageit.edu.in",
        pass: "qfhv wohg gjtf ikvz" 
      }
    });
    
    // Prepare email content
    const resetUrl = `https://appointmentdoctor.netlify.app/resetpassword/${user._id}/${token}`;
    const mailOptions = {
      from: "tarun.kumar.csbs25@heritageit.edu.in",
      to: email,
      subject: "Reset Password Link",
      text: resetUrl
    };
    
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ status: "Error sending email" });
      }
      return res.status(200).json({ status: "Email sent successfully" });
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ status: "Internal Server Error" });
  }
};

/**
 * Reset user password using token
 * @param {Object} req - Request object with user ID, token, and new password
 * @param {Object} res - Response object
 */
const resetpassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      
      try {
        // Update password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await User.findByIdAndUpdate(id, { password: hashedPassword });
        return res.status(200).json({ success: "Password reset successfully" });
      } catch (updateError) {
        console.error("Password update error:", updateError);
        return res.status(500).json({ error: "Failed to update password" });
      }
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getuser,
  getallusers,
  login,
  register,
  updateprofile,
  deleteuser,
  changepassword,
  forgotpassword,
  resetpassword,
};
