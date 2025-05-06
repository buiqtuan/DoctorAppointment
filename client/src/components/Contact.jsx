import React, { useState } from "react";
import "../styles/contact.css";

/**
 * Contact - Component for the website contact form
 * Allows users to send messages via Formspree integration
 */
const Contact = () => {
  // State for form fields
  const [formDetails, setFormDetails] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State for form validation
  const [errors, setErrors] = useState({});

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
    
    // Clear validation error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  /**
   * Validates form before submission
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name field
    if (!formDetails.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Validate email field
    if (!formDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formDetails.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Validate message field
    if (!formDetails.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formDetails.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = (e) => {
    // Prevent default form submission if validation fails
    if (!validateForm()) {
      e.preventDefault();
    }
  };

  /**
   * Renders an input field with error message if applicable
   * @param {string} type - Input type (text, email, etc.)
   * @param {string} name - Field name
   * @param {string} placeholder - Placeholder text
   * @param {boolean} isTextarea - Whether this is a textarea or regular input
   * @returns {JSX.Element} - The rendered input field
   */
  const renderField = (type, name, placeholder, isTextarea = false) => {
    const commonProps = {
      type,
      name,
      className: `form-input ${errors[name] ? "error-input" : ""}`,
      placeholder,
      value: formDetails[name],
      onChange: inputChange,
      required: true,
    };

    return (
      <div className="form-field">
        {isTextarea ? (
          <textarea
            {...commonProps}
            rows="8"
            cols="12"
          ></textarea>
        ) : (
          <input {...commonProps} />
        )}
        {errors[name] && <span className="error-message">{errors[name]}</span>}
      </div>
    );
  };

  return (
    <section className="register-section flex-center" id="contact">
      <div className="contact-container flex-center contact">
        <h2 className="form-heading">Contact Us</h2>
        <form
          method="POST"
          action={`https://formspree.io/f/${process.env.REACT_FORMIK_SECRET}`}
          className="register-form"
          onSubmit={handleSubmit}
        >
          {renderField("text", "name", "Enter your name")}
          {renderField("email", "email", "Enter your email")}
          {renderField("text", "message", "Enter your message", true)}

          <button type="submit" className="btn form-btn">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;