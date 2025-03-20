import axios from 'axios';
import { API_URL } from '../config';
import { TIMEZONE } from '../utils/dateUtils';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for consistent error handling
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', error);
    
    // Add detailed error information
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Error Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error Message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Format date for API requests using IST with proper timezone handling
const formatDateForAPI = (date) => {
  // If date is a string in YYYY-MM-DD format, use it directly
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Create a date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date provided to formatDateForAPI, using current date");
    // Get today's date in IST
    const options = { timeZone: TIMEZONE };
    const istNow = new Date().toLocaleString('en-US', options);
    const istDate = new Date(istNow);
    
    // Format in YYYY-MM-DD
    return istDate.toISOString().split('T')[0];
  }
  
  // Format the date in IST
  const options = { timeZone: TIMEZONE };
  const istDateStr = dateObj.toLocaleString('en-US', options);
  const istDate = new Date(istDateStr);
  
  // Return YYYY-MM-DD format
  return istDate.toISOString().split('T')[0];
};

// Process result data to handle special values
export const processResultData = (resultData) => {
  if (!resultData) return [];
  
  return resultData.map(item => ({
    ...item,
    formattedResult: item.visible_result === '-1' ? 'Pending' : (item.visible_result || 'N/A'),
    isPending: item.visible_result === '-1'
  }));
};

// Get monthly chart results for a team
export const getMonthlyResults = async (team, month) => {
  try {
    // Ensure month is correctly formatted for IST
    const formattedMonth = month || formatDateForAPI(new Date()).substring(0, 7);
    
    const response = await apiService.post('/results/monthly', { 
      team, 
      month: formattedMonth 
    });
    
    // Process results to handle -1 values
    return processResultData(response.data);
  } catch (error) {
    console.error(`Error fetching monthly results for team ${team}:`, error);
    throw error;
  }
};

// Get today's results
export const getTodayResults = async () => {
  try {
    const response = await apiService.get('/today');
    // Process results to handle -1 values
    return processResultData(response.data);
  } catch (error) {
    console.error('Error fetching today\'s results:', error);
    throw error;
  }
};

// Get daily results by date
export const getDailyResults = async (date) => {
  try {
    // Format date for IST
    const formattedDate = formatDateForAPI(date || new Date());
    
    const response = await apiService.get(`/results/daily?date=${formattedDate}`);
    // Process results to handle -1 values
    return processResultData(response.data);
  } catch (error) {
    console.error(`Error fetching daily results for ${date}:`, error);
    throw error;
  }
};

export default apiService;
