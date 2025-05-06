import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

// Set base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * AdminAppointments - Component for admin to view and manage all appointments
 * Shows appointments in a table with options to mark them as completed
 */
const AdminAppointments = () => {
  // State for storing all appointments
  const [appointments, setAppointments] = useState([]);
  
  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all appointments from the API
   * Updates the appointments state with the response
   */
  const fetchAllAppointments = async () => {
    try {
      dispatch(setLoading(true));
      const appointmentsData = await fetchData("/appointment/getallappointments");
      setAppointments(appointmentsData);
    } catch (error) {
      toast.error("Failed to fetch appointments");
      console.error("Error fetching appointments:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAllAppointments();
  }, []);

  /**
   * Marks an appointment as completed
   * @param {Object} appointment - The appointment to mark as completed
   */
  const markAppointmentComplete = async (appointment) => {
    try {
      // Show toast notification with promise for better UX
      await toast.promise(
        axios.put(
          "/appointment/completed",
          {
            appointid: appointment?._id,
            doctorId: appointment?.doctorId._id,
            doctorname: `${appointment?.userId?.firstname} ${appointment?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment marked as completed",
          error: "Unable to update appointment status",
          loading: "Updating appointment status...",
        }
      );

      // Refresh appointment list after updating
      fetchAllAppointments();
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  /**
   * Renders a table row for each appointment
   * @param {Object} appointment - The appointment data
   * @param {number} index - The index of the appointment in the array
   * @returns {JSX.Element} - The table row for the appointment
   */
  const renderAppointmentRow = (appointment, index) => (
    <tr key={appointment?._id}>
      <td>{index + 1}</td>
      <td>
        {appointment?.doctorId?.firstname + " " + appointment?.doctorId?.lastname}
      </td>
      <td>
        {appointment?.userId?.firstname + " " + appointment?.userId?.lastname}
      </td>
      <td>{appointment?.age}</td>
      <td>{appointment?.gender}</td>
      <td>{appointment?.number}</td>
      <td>{appointment?.bloodGroup}</td>
      <td>{appointment?.familyDiseases}</td>
      <td>{appointment?.date}</td>
      <td>{appointment?.time}</td>
      <td>{appointment?.createdAt.split("T")[0]}</td>
      <td>{appointment?.updatedAt.split("T")[1].split(".")[0]}</td>
      <td>{appointment?.status}</td>
      <td>
        <button
          className={`btn user-btn accept-btn ${
            appointment?.status === "Completed" ? "disable-btn" : ""
          }`}
          disabled={appointment?.status === "Completed"}
          onClick={() => markAppointmentComplete(appointment)}
        >
          Complete
        </button>
      </td>
    </tr>
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">All Appointments</h3>
          {appointments.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>P Name</th>
                    <th>P Age</th>
                    <th>P Gender</th>
                    <th>P Mobile No.</th>
                    <th>P bloodGroup</th>
                    <th>P Family Diseases</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Booking Date</th>
                    <th>Booking Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments?.map(renderAppointmentRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </>
  );
};

export default AdminAppointments;