import React, { useState } from "react";
import "../styles/bookappointment.css";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

/**
 * BookAppointment - Modal component for booking doctor appointments
 * Allows patients to select appointment date/time and provide medical information
 * 
 * @param {Function} setModalOpen - Function to control modal visibility
 * @param {Object} ele - Doctor information object
 */
const BookAppointment = ({ setModalOpen, ele }) => {
  // Form state for appointment details
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
    age: "",
    bloodGroup: "",
    gender: "",
    number: "",
    familyDiseases: "",
  });

  /**
   * Handles input changes for all form fields
   * @param {Object} e - Event object
   */
  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  /**
   * Validates form fields before submission
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const { date, time, age, gender, number } = formDetails;
    
    if (!date) {
      toast.error("Please select an appointment date");
      return false;
    }
    
    if (!time) {
      toast.error("Please select an appointment time");
      return false;
    }
    
    if (!age) {
      toast.error("Please enter your age");
      return false;
    }
    
    if (!gender) {
      toast.error("Please select your gender");
      return false;
    }
    
    if (!number) {
      toast.error("Please enter your mobile number");
      return false;
    } else if (number.length < 10) {
      toast.error("Please enter a valid mobile number");
      return false;
    }
    
    return true;
  };

  /**
   * Submits the appointment booking request to the server
   * @param {Object} e - Event object
   */
  const bookAppointment = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) return;
    
    try {
      await toast.promise(
        axios.post(
          "/appointment/bookappointment",
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            age: formDetails.age,
            bloodGroup: formDetails.bloodGroup,
            gender: formDetails.gender,
            number: formDetails.number,
            familyDiseases: formDetails.familyDiseases,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment booked successfully",
          error: "Unable to book appointment",
          loading: "Booking appointment...",
        }
      );
      
      // Close modal after successful booking
      setModalOpen(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  /**
   * Renders the appointment booking form
   * @returns {JSX.Element} Appointment booking form
   */
  const renderBookingForm = () => (
    <form className="register-form">
      <input
        type="date"
        name="date"
        className="form-input"
        value={formDetails.date}
        onChange={inputChange}
        min={new Date().toISOString().split('T')[0]} // Prevent past dates
        required
      />
      
      <input
        type="time"
        name="time"
        className="form-input"
        value={formDetails.time}
        onChange={inputChange}
        required
      />
      
      <input
        type="number"
        name="age"
        placeholder="Age"
        className="form-input"
        value={formDetails.age}
        onChange={inputChange}
        min="1"
        max="120"
        required
      />
      
      <input
        type="text"
        name="bloodGroup"
        placeholder="Blood Group (Optional)"
        className="form-input"
        value={formDetails.bloodGroup}
        onChange={inputChange}
      />
      
      <select
        name="gender"
        className="form-input"
        value={formDetails.gender}
        onChange={inputChange}
        required
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      
      <input
        type="number"
        name="number"
        placeholder="Mobile Number"
        className="form-input"
        value={formDetails.number}
        onChange={inputChange}
        required
      />
      
      <textarea
        name="familyDiseases"
        placeholder="Family Diseases"
        className="form-input"
        value={formDetails.familyDiseases}
        onChange={inputChange}
        rows="3"
      ></textarea>

      <button
        type="submit"
        className="btn form-btn"
        onClick={bookAppointment}
      >
        Book Appointment
      </button>
    </form>
  );

  return (
    <div className="modal flex-center">
      <div className="modal__content">
        <h2 className="page-heading">Book Appointment</h2>
        <IoMdClose
          onClick={() => setModalOpen(false)}
          className="close-btn"
          aria-label="Close modal"
        />
        <div className="register-container flex-center book">
          {renderBookingForm()}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;