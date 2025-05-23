import React, { useEffect, useState } from "react";
import "../styles/profile.css";
import axios from "axios";
import toast from "react-hot-toast";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "./Loading";
import fetchData from "../helper/apiCall";
import jwt_decode from "jwt-decode";

// Set base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Aprofile - Admin profile management component
 * Allows administrators to view and update their profile information
 */
function Aprofile() {
  // Get user ID from token
  const { userId } = jwt_decode(localStorage.getItem("token"));
  
  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  
  // State for profile picture
  const [file, setFile] = useState("");
  
  // Form state for user details
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    age: "",
    mobile: "",
    gender: "neither",
    address: "",
    password: "",
    confpassword: "",
  });

  /**
   * Fetches user data from the API and updates form state
   * Handles null values for optional fields
   */
  const getUser = async () => {
    try {
      dispatch(setLoading(true));
      const userData = await fetchData(`/user/getuser/${userId}`);
      
      // Update form with user data, handling null values
      setFormDetails({
        ...userData,
        password: "",
        confpassword: "",
        mobile: userData.mobile === null ? "" : userData.mobile,
        age: userData.age === null ? "" : userData.age,
      });
      
      setFile(userData.pic);
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error("Error fetching user data:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getUser();
  }, []);

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
   * Validates form input and submits data to update profile
   * @param {Object} e - Event object
   */
  const formSubmit = async (e) => {
    try {
      e.preventDefault();
      const {
        firstname,
        lastname,
        email,
        age,
        mobile,
        address,
        gender,
        password,
        confpassword,
      } = formDetails;

      // Validate form inputs
      if (!email) {
        return toast.error("Email should not be empty");
      } else if (firstname.length < 3) {
        return toast.error("First name must be at least 3 characters long");
      } else if (lastname.length < 3) {
        return toast.error("Last name must be at least 3 characters long");
      } else if (password && password.length < 5) {
        return toast.error("Password must be at least 5 characters long");
      } else if (password !== confpassword) {
        return toast.error("Passwords do not match");
      }
      
      // Submit form data with toast notification
      await toast.promise(
        axios.put(
          "/user/updateprofile",
          {
            firstname,
            lastname,
            age,
            mobile,
            address,
            gender,
            email,
            password,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          pending: "Updating profile...",
          success: "Profile updated successfully",
          error: "Unable to update profile",
        }
      );

      // Clear password fields after successful update
      setFormDetails({ ...formDetails, password: "", confpassword: "" });
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Unable to update profile");
    }
  };

  /**
   * Renders the profile form with current user data
   * @returns {JSX.Element} Profile form
   */
  const renderProfileForm = () => (
    <form onSubmit={formSubmit} className="register-form">
      <div className="form-same-row">
        <input
          type="text"
          name="firstname"
          className="form-input"
          placeholder="Enter your first name"
          value={formDetails.firstname}
          onChange={inputChange}
        />
        <input
          type="text"
          name="lastname"
          className="form-input"
          placeholder="Enter your last name"
          value={formDetails.lastname}
          onChange={inputChange}
        />
      </div>
      <div className="form-same-row">
        <input
          type="email"
          name="email"
          className="form-input"
          placeholder="Enter your email"
          value={formDetails.email}
          onChange={inputChange}
        />
        <select
          name="gender"
          value={formDetails.gender}
          className="form-input"
          id="gender"
          onChange={inputChange}
        >
          <option value="neither">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="form-same-row">
        <input
          type="text"
          name="age"
          className="form-input"
          placeholder="Enter your age"
          value={formDetails.age}
          onChange={inputChange}
        />
        <input
          type="text"
          name="mobile"
          className="form-input"
          placeholder="Enter your mobile number"
          value={formDetails.mobile}
          onChange={inputChange}
        />
      </div>
      <textarea
        type="text"
        name="address"
        className="form-input"
        placeholder="Enter your address"
        value={formDetails.address}
        onChange={inputChange}
        rows="2"
      ></textarea>
      <div className="form-same-row">
        <input
          type="password"
          name="password"
          className="form-input"
          placeholder="Enter your password"
          value={formDetails.password}
          onChange={inputChange}
        />
        <input
          type="password"
          name="confpassword"
          className="form-input"
          placeholder="Confirm your password"
          value={formDetails.confpassword}
          onChange={inputChange}
        />
      </div>
      <button type="submit" className="btn form-btn">
        Update
      </button>
    </form>
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="register-section flex-center">
          <div className="profile-container flex-center">
            <h2 className="form-heading">Profile</h2>
            <img src={file} alt="profile" className="profile-pic" />
            {renderProfileForm()}
          </div>
        </section>
      )}
    </>
  );
}

export default Aprofile;