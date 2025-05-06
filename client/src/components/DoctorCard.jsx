import "../styles/doctorcard.css";
import React, { useState } from "react";
import BookAppointment from "./BookAppointment"; // Simplified import path
import { toast } from "react-hot-toast";

/**
 * DoctorCard - Displays doctor information and handles appointment booking
 * 
 * @param {Object} ele - Doctor data object containing user details and professional information
 * @returns {JSX.Element} - Rendered doctor card component
 */
const DoctorCard = ({ ele }) => {
  // Controls visibility of appointment booking modal
  const [modalOpen, setModalOpen] = useState(false);
  
  // Get authentication token from localStorage
  const token = localStorage.getItem("token") || "";

  /**
   * Handles opening the appointment booking modal
   * Validates user authentication before allowing appointment booking
   */
  const handleModal = () => {
    if (!token) {
      toast.error("You must log in first");
      return;
    }
    setModalOpen(true);
  };

  // Extract user details for cleaner rendering
  const { userId, specialization, experience, fees } = ele || {};
  const { firstname, lastname, mobile, pic } = userId || {};
  
  // Default profile image if doctor's picture is not available
  const defaultProfileImg = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  return (
    <div className="card">
      <div className="card-img flex-center">
        <img
          src={pic || defaultProfileImg}
          alt={`Dr. ${firstname} ${lastname}'s profile`}
        />
      </div>
      
      <h3 className="card-name">
        Dr. {firstname && lastname ? `${firstname} ${lastname}` : "Unknown"}
      </h3>
      
      <p className="specialization">
        <strong>Specialization: </strong>
        {specialization || "Not specified"}
      </p>
      
      <p className="experience">
        <strong>Experience: </strong>
        {experience || 0}yrs
      </p>
      
      <p className="fees">
        <strong>Fees per consultation: </strong>$ {fees || 0}
      </p>
      
      <p className="phone">
        <strong>Phone: </strong>
        {mobile || "Not available"}
      </p>
      
      <button
        className="btn appointment-btn"
        onClick={handleModal}
        aria-label="Book Appointment"
      >
        Book Appointment
      </button>
      
      {/* Conditionally render appointment booking modal */}
      {modalOpen && (
        <BookAppointment
          setModalOpen={setModalOpen}
          ele={ele}
        />
      )}
    </div>
  );
};

export default DoctorCard;