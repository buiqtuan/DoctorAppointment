/**
 * Doctor Application Form Component
 * 
 * This component allows healthcare professionals to apply to be listed as doctors
 * in the system by submitting their credentials, experience and consultation fees.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Styles
import "../styles/contact.css";

// Configure axios base URL from environment variables
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const ApplyDoctor = () => {
  const navigate = useNavigate();
  
  /**
   * Form state for doctor application
   * @property {string} specialization - Medical specialty (e.g., "Cardiology", "Neurology")
   * @property {string} experience - Years of professional experience
   * @property {string} fees - Consultation fee in dollars
   */
  const [formDetails, setFormDetails] = useState({
    specialization: "",
    experience: "",
    fees: "",
  });

  /**
   * Validates form input fields
   * @returns {boolean} True if all fields are valid, false otherwise
   */
  const validateForm = () => {
    // Validate specialization (required, at least 3 characters)
    if (!formDetails.specialization || formDetails.specialization.length < 3) {
      toast.error("Please enter a valid specialization (minimum 3 characters)");
      return false;
    }
    
    // Validate experience (required, must be a positive number)
    if (!formDetails.experience || Number(formDetails.experience) <= 0) {
      toast.error("Please enter valid years of experience");
      return false;
    }
    
    // Validate fees (required, must be a positive number)
    if (!formDetails.fees || Number(formDetails.fees) <= 0) {
      toast.error("Please enter valid consultation fees");
      return false;
    }
    
    return true;
  };

  /**
   * Handles form input changes and updates state
   * @param {Object} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  /**
   * Submits the doctor application to the server
   * @param {Object} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) return;
    
    try {
      // Use toast.promise to show loading, success and error states
      await toast.promise(
        axios.post(
          "/doctor/applyfordoctor",
          { formDetails },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          loading: "Submitting your application...",
          success: "Application submitted successfully",
          error: "Failed to submit application. Please try again.",
        }
      );

      // Redirect to home page after successful submission
      navigate("/");
    } catch (error) {
      console.error("Application submission error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center apply-doctor" id="contact">
        <div className="register-container flex-center contact">
          <h2 className="form-heading">Apply to Join Our Medical Team</h2>
          
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Specialization Field */}
            <div className="form-group">
              <label htmlFor="specialization">Medical Specialization</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                className="form-input"
                placeholder="e.g., Cardiology, Neurology, Pediatrics"
                value={formDetails.specialization}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Experience Field */}
            <div className="form-group">
              <label htmlFor="experience">Years of Experience</label>
              <input
                type="number"
                id="experience"
                name="experience"
                className="form-input"
                placeholder="Years of professional experience"
                min="0"
                value={formDetails.experience}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Fees Field */}
            <div className="form-group">
              <label htmlFor="fees">Consultation Fee ($)</label>
              <input
                type="number"
                id="fees"
                name="fees"
                className="form-input"
                placeholder="Your consultation fee in USD"
                min="0"
                value={formDetails.fees}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Submit Button */}
            <button type="submit" className="btn form-btn">
              Submit Application
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ApplyDoctor;