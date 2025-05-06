import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import jwt_decode from "jwt-decode";
import axios from "axios";
import "../styles/navbar.css";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Navbar component for application navigation
 * Displays different links based on user role (Doctor, Patient, or unauthenticated)
 * Includes mobile-responsive menu with toggle functionality
 */
const Navbar = () => {
  // State to manage mobile menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Redux and routing hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Authentication state
  const token = localStorage.getItem("token") || "";
  const user = token ? jwt_decode(token) : null;
  const { userInfo } = useSelector((state) => state.root);
  
  /**
   * Handles user logout
   * Clears user data from Redux store and localStorage, then redirects to login
   */
  const handleLogout = () => {
    dispatch(setUserInfo({}));
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  /**
   * Toggles the mobile menu state
   */
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  /**
   * Renders navigation links based on user role
   * @returns {JSX.Element} Navigation links appropriate for user's role
   */
  const renderRoleBasedLinks = () => {
    if (!user) {
      return (
        <>
          <li>
            <NavLink className="btn" to="/login">Login</NavLink>
          </li>
          <li>
            <NavLink className="btn" to="/register">Register</NavLink>
          </li>
        </>
      );
    }
    
    // Common links for authenticated users
    const commonLinks = (
      <>
        <li>
          <NavLink to="/notifications">Notifications</NavLink>
        </li>
        <li>
          <HashLink to="/#contact">Contact Us</HashLink>
        </li>
        <li>
          <NavLink to="/profile">Profile</NavLink>
        </li>
        <li>
          <NavLink to="/ChangePassword">Change Password</NavLink>
        </li>
        <li>
          <span className="btn" onClick={handleLogout}>Logout</span>
        </li>
      </>
    );
    
    // Doctor-specific links
    if (user.role === "Doctor") {
      return (
        <>
          <li>
            <NavLink to="/applyfordoctor">Apply for doctor</NavLink>
          </li>
          <li>
            <NavLink to="/appointments">Appointments</NavLink>
          </li>
          {commonLinks}
        </>
      );
    }
    
    // Patient-specific links
    if (user.role === "Patient") {
      return (
        <>
          <li>
            <NavLink to="/doctors">Doctors</NavLink>
          </li>
          {commonLinks}
        </>
      );
    }
    
    return commonLinks;
  };

  return (
    <header>
      {/* Main navigation */}
      <nav className={menuOpen ? "nav-active" : ""}>
        {/* Logo */}
        <h2 className="nav-logo">
          <NavLink to="/">Doctor's Appointment</NavLink>
        </h2>
        
        {/* Navigation links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          {renderRoleBasedLinks()}
        </ul>
      </nav>
      
      {/* Mobile menu toggle buttons */}
      <div className="menu-icons">
        {!menuOpen ? (
          <FiMenu className="menu-open" onClick={toggleMenu} aria-label="Open menu" />
        ) : (
          <RxCross1 className="menu-close" onClick={toggleMenu} aria-label="Close menu" />
        )}
      </div>
    </header>
  );
};

export default Navbar;