import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Empty from "../components/Empty";
import BookAppointment from "../components/BookAppointment";
import DoctorSearch from "../components/DoctorSearch";

// Redux
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";

// Styles
import "../styles/doctors.css";
import "../styles/doctorcard.css";

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * DoctorCard - Displays individual doctor information and handles appointment booking
 */
const DoctorCard = ({ ele }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token") || "";

  const handleModal = () => {
    if (!token) {
      toast.error("You must log in first");
      return;
    }
    setModalOpen(true);
  };

  const { user, specializations, experience, fees } = ele || {};
  const { firstname, lastname, mobile, pic } = user || {};

  const defaultProfileImg =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  const specializationNames = specializations && specializations.length > 0
    ? specializations.map(spec => spec.name).join(", ")
    : "Not specified";

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
        <strong>Specializations: </strong>
        {specializationNames}
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

      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

/**
 * Doctors Page - Main component that displays all available doctors
 */
const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]); // Store all doctors for reset
  const [isSearchActive, setIsSearchActive] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all available doctors from the API
   */
  const fetchAllDoctors = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetchData("/doctor/getalldoctors");
      setDoctors(response || []);
      setAllDoctors(response || []); // Store for reset functionality
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Handles doctor search with filters
   */
  const handleSearch = async (searchFilters) => {
    try {
      dispatch(setLoading(true));
      setIsSearchActive(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchFilters.specifications.length > 0) {
        params.append('specifications', searchFilters.specifications.join(','));
      }
      
      if (searchFilters.minExperience) {
        params.append('minExperience', searchFilters.minExperience);
      }
      
      if (searchFilters.minFees) {
        params.append('minFees', searchFilters.minFees);
      }
      
      if (searchFilters.maxFees) {
        params.append('maxFees', searchFilters.maxFees);
      }

      const response = await fetchData(`/doctor/search?${params.toString()}`);
      
      if (response && response.success) {
        setDoctors(response.data || []);
        toast.success(`Found ${response.count || 0} doctors matching your criteria`);
      } else {
        setDoctors([]);
        toast.info("No doctors found matching your search criteria");
      }
    } catch (error) {
      console.error("Error searching doctors:", error);
      toast.error("Failed to search doctors. Please try again.");
      setDoctors([]);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Resets search and shows all doctors
   */
  const handleResetSearch = () => {
    setDoctors(allDoctors);
    setIsSearchActive(false);
    toast.success("Search filters cleared");
  };

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchAllDoctors();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container">
        {loading ? (
          <Loading />
        ) : (
          <section className="container doctors">
            <h2 className="page-heading">Our Doctors</h2>
            
            {/* Search Component */}
            <DoctorSearch onSearch={handleSearch} onReset={handleResetSearch} />
            
            {/* Search Results Info */}
            {isSearchActive && (
              <div className="search-info">
                <p>Search Results: {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
              </div>
            )}
            
            {doctors.length > 0 ? (
              <div className="doctors-card-container">
                {doctors.map((doctor, index) => (
                  <DoctorCard key={doctor.id || index} ele={doctor} />
                ))}
              </div>
            ) : (
              <Empty message={
                isSearchActive 
                  ? "No doctors found matching your search criteria. Try adjusting your filters."
                  : "No doctors available at the moment. Please check back later."
              } />
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Doctors;