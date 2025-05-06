import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/notification.css";
import "../styles/user.css";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";

/**
 * Notifications Component
 * 
 * Displays user notifications with pagination functionality.
 * Fetches notifications from the API and handles pagination client-side.
 */
const Notifications = () => {
  // State for storing notification data
  const [notifications, setNotifications] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const notificationsPerPage = 8;
  
  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches notifications from the API
   * Uses server-side pagination for better performance
   */
  const fetchNotifications = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      
      // Fetch data with pagination parameters
      const response = await fetchData(
        `/notification/getallnotifs?page=${currentPage - 1}&limit=${notificationsPerPage}`
      );
      
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
        setTotalCount(response.totalCount || response.data.length);
      } else {
        // Handle unexpected response format
        console.error("Unexpected API response format:", response);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      dispatch(setLoading(false));
    }
  }, [currentPage, dispatch]);

  // Fetch notifications when component mounts or page changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Calculate total pages based on item count
  const totalPages = Math.ceil(totalCount / notificationsPerPage);

  /**
   * Handles page change in pagination
   * @param {number} page - The page number to navigate to
   */
  const handlePageChange = (page) => {
    // Validate page number
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * Renders pagination buttons
   * @returns {JSX.Element[]} Array of pagination button elements
   */
  const renderPagination = () => {
    const pages = [];
    
    // Display previous page button if not on first page
    if (currentPage > 1) {
      pages.push(
        <button 
          key="prev" 
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
          className="pagination-btn"
        >
          &laquo;
        </button>
      );
    }
    
    // Generate page number buttons
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          aria-label={`Page ${i}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    
    // Display next page button if not on last page
    if (currentPage < totalPages) {
      pages.push(
        <button 
          key="next" 
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
          className="pagination-btn"
        >
          &raquo;
        </button>
      );
    }
    
    return pages;
  };

  /**
   * Formats date string from ISO format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date (YYYY-MM-DD)
   */
  const formatDate = (dateString) => {
    return dateString.split("T")[0];
  };

  /**
   * Formats time string from ISO format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time (HH:MM:SS)
   */
  const formatTime = (dateString) => {
    return dateString.split("T")[1].split(".")[0];
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          {/* Page heading */}
          <h2 className="page-heading">Your Notifications</h2>

          {notifications.length > 0 ? (
            <div className="notifications">
              {/* Notifications table */}
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Content</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification, index) => (
                    <tr key={notification?._id || index}>
                      <td>{(currentPage - 1) * notificationsPerPage + index + 1}</td>
                      <td>{notification?.content}</td>
                      <td>{formatDate(notification?.updatedAt)}</td>
                      <td>{formatTime(notification?.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination" aria-label="Pagination navigation">
                  {renderPagination()}
                </div>
              )}
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Notifications;