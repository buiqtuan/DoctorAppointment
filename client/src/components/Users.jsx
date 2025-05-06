import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Users component for admin dashboard
 * Displays a list of all users with search and filter functionality
 * Allows administrators to delete users
 */
const Users = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Redux hooks
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all users from the API with optional filtering and search
   * Updates the users state with the retrieved data
   */
  const getAllUsers = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      
      // Build query URL with filter and search params if provided
      let url = "/user/getallusers";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }
      
      const userData = await fetchData(url);
      setUsers(userData);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching users:", error);
      dispatch(setLoading(false));
    }
  }, [dispatch, filter, searchTerm]);

  /**
   * Deletes a user after confirmation
   * Shows toast notifications during the process
   * @param {string} userId - The ID of the user to delete
   */
  const deleteUser = async (userId) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete?");
      if (confirm) {
        await toast.promise(
          axios.delete("/user/deleteuser", {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            data: { userId },
          }),
          {
            pending: "Deleting in...",
            success: "User deleted successfully",
            error: "Unable to delete user",
            loading: "Deleting user..."
          }
        );
        // Refresh the user list after deletion
        getAllUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return error;
    }
  };

  // Fetch all users on component mount
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  /**
   * Filters users based on selected filter and search term
   * Currently supports filtering by first name
   */
  const filteredUsers = users.filter((user) => {
    if (filter === "all") {
      return true;
    } else if (filter === "firstname") {
      return user.firstname.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return true;
    }
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          {/* Filter and Search Controls */}
          <div className="filter-search-container">
            {/* Filter dropdown */}
            <div className="filter">
              <label htmlFor="filter">Filter by:</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter users"
              >
                <option value="all">All</option>
                <option value="firstname">Name</option>
              </select>
            </div>

            {/* Search input */}
            <div className="search">
              <label htmlFor="search">Search:</label>
              <input
                type="text"
                className="form-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                aria-label="Search users"
              />
            </div>
          </div>
          
          <h3 className="home-sub-heading">All Users</h3>
          
          {filteredUsers.length > 0 ? (
            <div className="user-container">
              {/* Users Table */}
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Pic</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile No.</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Is Doctor</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          className="user-table-pic"
                          src={user.pic}
                          alt={`${user.firstname}'s profile`}
                        />
                      </td>
                      <td>{user.firstname}</td>
                      <td>{user.lastname}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>{user.age}</td>
                      <td>{user.gender}</td>
                      <td>{user.isDoctor ? "Yes" : "No"}</td>
                      <td className="select">
                        <button
                          className="btn user-btn"
                          onClick={() => deleteUser(user._id)}
                          aria-label={`Remove ${user.firstname}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
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

export default Users;