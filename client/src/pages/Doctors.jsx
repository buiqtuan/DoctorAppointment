/**
 * Doctors Page Component
 * 
 * Displays a directory of all available doctors in the system.
 * Fetches doctor data from the API and renders it in a responsive grid layout.
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Components
import DoctorCard from "../components/DoctorCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Empty from "../components/Empty";

// Redux actions
import { setLoading } from "../redux/reducers/rootSlice";

// API and Styles
import fetchData from "../helper/apiCall";
import "../styles/doctors.css";

const Doctors = () => {
  // State management
  const [doctors, setDoctors] = useState([]);
  
  // Redux hooks
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all doctors from the API
   * Displays loading state during API call
   */
  const fetchAllDoctors = async () => {
    try {
      dispatch(setLoading(true));
      const data = await fetchData(`/doctor/getalldoctors`);
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchAllDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Conditional rendering based on loading state */}
      {loading ? (
        <Loading />
      ) : (
        <section className="container doctors" aria-labelledby="doctors-heading">
          <h2 id="doctors-heading" className="page-heading">Our Doctors</h2>
          
          {/* Show doctor cards if available, otherwise show empty state */}
          {doctors.length > 0 ? (
            <div className="doctors-card-container" role="list">
              {doctors.map((doctor) => (
                <DoctorCard
                  ele={doctor}
                  key={doctor._id}
                />
              ))}
            </div>
          ) : (
            <Empty message="No doctors available at the moment. Please check back later." />
          )}
        </section>
      )}
      
      <Footer />
    </>
  );
};

export default Doctors;