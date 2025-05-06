/**
 * Appointments Page Component
 * 
 * This component displays a user's appointments with pagination,
 * allowing them to view and manage their medical appointments.
 * Doctors can mark appointments as completed.
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import jwt_decode from "jwt-decode";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Empty from "../components/Empty";

// Redux and API
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";

// Styles
import "../styles/user.css";

const Appointments = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Constants
  const ITEMS_PER_PAGE = 5;
  
  // Redux
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  
  // Get user ID from JWT token
  const { userId } = jwt_decode(localStorage.getItem("token"));

  /**
   * Fetches all appointments for the current user
   */
  const fetchAppointments = async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchData(
        `/appointment/getallappointments?search=${userId}`
      );
      setAppointments(result);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Load appointments when component mounts
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  /**
   * Handles page change in pagination
   * @param {number} page - Page number to navigate to
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Renders pagination buttons
   * @returns {Array} Array of pagination button elements
   */
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? "active" : ""}
          aria-label={`Page ${i}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // Get appointments for current page
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /**
   * Marks an appointment as completed
   * @param {Object} appointment - The appointment to mark as completed
   */
  const completeAppointment = async (appointment) => {
    try {
      dispatch(setLoading(true));
      await axios.put(
        "/appointment/completed",
        {
          appointid: appointment._id,
          doctorId: appointment.doctorId._id,
          doctorname: `${appointment.userId.firstname} ${appointment.userId.lastname}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Appointment completed successfully.");
      fetchAppointments();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Navbar />
      <main className="container appointment-page">
        {loading ? (
          <Loading />
        ) : (
          <section className="container notif-section">
            <h2 className="page-heading">Your Appointments</h2>

            {appointments.length > 0 ? (
              <div className="appointments">
                <div className="table-responsive">
                  <table className="appointment-table">
                    <thead>
                      <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Doctor</th>
                        <th scope="col">Patient Name</th>
                        <th scope="col">Age</th>
                        <th scope="col">Gender</th>
                        <th scope="col">Mobile</th>
                        <th scope="col">Blood Group</th>
                        <th scope="col">Family Medical History</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAppointments.map((appointment, index) => (
                        <tr key={appointment._id}>
                          <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                          <td className="doctor-name">
                            {`${appointment.doctorId.firstname} ${appointment.doctorId.lastname}`}
                          </td>
                          <td>
                            {`${appointment.userId.firstname} ${appointment.userId.lastname}`}
                          </td>
                          <td>{appointment.age}</td> 
                          <td>{appointment.gender}</td>
                          <td>{appointment.number}</td>
                          <td>{appointment.bloodGroup || 'N/A'}</td>
                          <td className="family-diseases">
                            {appointment.familyDiseases || 'None'}
                          </td>
                          <td>{new Date(appointment.date).toLocaleDateString()}</td>
                          <td className={`status ${appointment.status.toLowerCase()}`}>
                            {appointment.status}
                          </td>
                          <td>
                            <button
                              className="btn user-btn complete-btn"
                              onClick={() => completeAppointment(appointment)}
                              disabled={appointment.status === "Completed"}
                              aria-label="Mark appointment as completed"
                            >
                              {appointment.status === "Completed" ? "Completed" : "Complete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {totalPages > 1 && (
                  <div className="pagination" role="navigation" aria-label="Pagination">
                    <button 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      &laquo; Prev
                    </button>
                    
                    {renderPagination()}
                    
                    <button 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Empty message="No appointments found. Schedule an appointment with a doctor." />
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Appointments;