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
 * AdminDoctors - Component for admin to view and manage all doctors
 * Provides functionality to search, filter, and delete doctors
 */
const AdminDoctors = () => {
  // State for storing doctor data and filter options
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all doctors from the API with optional filters
   * Updates the doctors state with the response
   */
  const fetchAllDoctors = async () => {
    try {
      dispatch(setLoading(true));
      
      // Build URL with filter and search parameters
      let url = "/doctor/getalldoctors";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }
      
      const doctorsData = await fetchData(url);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error("Failed to fetch doctors");
      console.error("Error fetching doctors:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Deletes a doctor after confirmation
   * @param {string} userId - The ID of the user/doctor to delete
   */
  const deleteDoctor = async (userId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this doctor?");
      if (!confirmed) return;
      
      // Show toast notification with promise for better UX
      await toast.promise(
        axios.put(
          "/doctor/deletedoctor",
          { userId },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Doctor deleted successfully",
          error: "Unable to delete doctor",
          loading: "Deleting doctor...",
        }
      );
      
      // Refresh doctors list after deletion
      fetchAllDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchAllDoctors();
  }, []);

  /**
   * Filters doctors based on selected filter and search term
   * This is used when client-side filtering is needed
   */
  const getFilteredDoctors = () => {
    return doctors.filter((doctor) => {
      if (filter === "all") {
        return true;
      } else if (filter === "specialization") {
        return doctor.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      } else if (filter === "firstname") {
        return (
          doctor.userId &&
          doctor.userId.firstname.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });
  };

  const filteredDoctors = getFilteredDoctors();

  /**
   * Renders a table row for each doctor
   * @param {Object} doctor - The doctor data
   * @param {number} index - The index of the doctor in the array
   * @returns {JSX.Element} - The table row for the doctor
   */
  const renderDoctorRow = (doctor, index) => (
    <tr key={doctor?._id}>
      <td>{index + 1}</td>
      <td>
        <img
          className="user-table-pic"
          src={doctor?.userId?.pic}
          alt={doctor?.userId?.firstname}
        />
      </td>
      <td>{doctor?.userId?.firstname}</td>
      <td>{doctor?.userId?.lastname}</td>
      <td>{doctor?.userId?.email}</td>
      <td>{doctor?.userId?.mobile}</td>
      <td>{doctor?.experience}</td>
      <td>{doctor?.specialization}</td>
      <td>{doctor?.fees}</td>
      <td className="select">
        <button
          className="btn user-btn"
          onClick={() => deleteDoctor(doctor?.userId?._id)}
        >
          Remove
        </button>
      </td>
    </tr>
  );

  /**
   * Renders the filter and search controls
   * @returns {JSX.Element} - Filter and search UI
   */
  const renderFilterControls = () => (
    <div className="ayx">
      <div className="filter">
        <label htmlFor="filter">Filter by:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="firstname">Name</option>
          <option value="specialization">Specialization</option>
        </select>
      </div>

      <div className="search">
        <label htmlFor="search">Search:</label>
        <input
          type="text"
          className="form-input"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          {renderFilterControls()}
          <h3 className="home-sub-heading">All Doctors</h3>
          {filteredDoctors.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Pic</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile No.</th>
                    <th>Experience</th>
                    <th>Specialization</th>
                    <th>Fees</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map(renderDoctorRow)}
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

export default AdminDoctors;