import axios from "axios";

// Set the base URL for all axios requests from environment variables
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Makes an authenticated GET request to the specified endpoint
 * Automatically includes the authentication token from localStorage
 * 
 * @param {string} url - The API endpoint to fetch data from
 * @returns {Promise<any>} - Promise resolving to the response data
 * @throws {Error} - Throws error if the request fails
 */
const fetchData = async (url) => {
  try {
    // Get the authentication token from localStorage
    const token = localStorage.getItem("token");
    
    // Make the authenticated request
    const { data } = await axios.get(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    
    return data;
  } catch (error) {
    // Log the error for debugging
    console.error(`Error fetching data from ${url}:`, error);
    
    // Rethrow with a more descriptive message
    throw new Error(
      error.response?.data?.message || 
      "Failed to fetch data. Please try again."
    );
  }
};

export default fetchData;