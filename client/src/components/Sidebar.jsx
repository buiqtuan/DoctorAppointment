import React from "react";
import {
  FaHome,
  FaList,
  FaUser,
  FaUserMd,
  FaUsers,
  FaEnvelope,
} from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import "../styles/sidebar.css";

/**
 * Sidebar component for dashboard navigation
 * Provides links to different sections of the admin dashboard
 * Includes logout functionality
 */
const Sidebar = () => {
  // Redux and routing hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Navigation menu items configuration
   * Each item contains a name, path, and icon
   */
  const sidebarItems = [
    {
      name: "Home",
      path: "/dashboard/home",
      icon: <FaHome title="Dashboard Home" />,
    },
    {
      name: "Users",
      path: "/dashboard/users",
      icon: <FaUsers title="Manage Users" />,
    },
    {
      name: "Doctors",
      path: "/dashboard/doctors",
      icon: <FaUserMd title="Manage Doctors" />,
    },
    {
      name: "Appointments",
      path: "/dashboard/appointments",
      icon: <FaList title="View Appointments" />,
    },
    {
      name: "Applications",
      path: "/dashboard/applications",
      icon: <FaEnvelope title="Doctor Applications" />,
    },
    {
      name: "Profile",
      path: "/dashboard/aprofile",
      icon: <FaUser title="Admin Profile" />,
    },
  ];

  /**
   * Handles user logout
   * Clears user data from Redux store and localStorage
   * Redirects to login page
   */
  const handleLogout = () => {
    dispatch(setUserInfo({}));
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <section className="sidebar-section flex-center">
      <div className="sidebar-container">
        {/* Navigation menu */}
        <ul>
          {sidebarItems.map((item, index) => (
            <li key={index}>
              {item.icon}
              <NavLink to={item.path}>{item.name}</NavLink>
            </li>
          ))}
        </ul>
        
        {/* Logout button */}
        <div 
          className="logout-container" 
          onClick={handleLogout}
          role="button"
          aria-label="Logout"
        >
          <MdLogout title="Logout" />
          <p>Logout</p>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;