export const formatDate = (dateString) => {
  try {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Error";
  }
};

export const formatTime = (timeString) => {
  try {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try to parse time component only if full date parsing fails
      // This handles cases where timeString might just be "HH:MM:SS"
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          const hours = parseInt(parts[0]);
          const minutes = parseInt(parts[1]);
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
      }
      return "Invalid Time";
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error("Time formatting error:", e);
    return "Error";
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  return `${formatDate(dateTimeString)} ${formatTime(dateTimeString)}`;
};

// Parse a SQL datetime string into date and time parts
export const parseSqlDateTime = (sqlDateTime) => {
  if (!sqlDateTime) return { date: null, time: null };
  
  try {
    // Handle MySQL datetime format: YYYY-MM-DD HH:MM:SS
    const parts = sqlDateTime.split(' ');
    
    if (parts.length >= 2) {
      return {
        date: parts[0],
        time: parts[1]
      };
    }
    
    // If format is not as expected, return the original
    return {
      date: sqlDateTime,
      time: null
    };
  } catch (e) {
    console.error("SQL DateTime parsing error:", e);
    return { date: null, time: null };
  }
};

// Format result values, handling special cases like -1 (pending)
export const formatResult = (result) => {
  if (!result && result !== 0) return 'N/A';
  
  // Handle pending results (represented as -1)
  if (result === '-1' || result === -1) {
    return 'Pending';
  }
  
  // Return the result as is
  return result;
};

// Constants for timezone
export const TIMEZONE = 'Asia/Kolkata';
export const TIMEZONE_OFFSET = '+05:30'; // Indian Standard Time

// Format date specifically for Indian timezone
export const formatDateIST = (dateString) => {
  try {
    if (!dateString) return "N/A";
    
    // Options for Indian Standard Time
    const options = {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Error";
  }
};

// Format time specifically for Indian timezone
export const formatTimeIST = (timeString) => {
  try {
    if (!timeString) return "N/A";
    
    // Options for Indian Standard Time
    const options = {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      // Try to parse time component only if full date parsing fails
      // This handles cases where timeString might just be "HH:MM:SS"
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          const hours = parseInt(parts[0]);
          const minutes = parseInt(parts[1]);
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
      }
      return "Invalid Time";
    }
    
    return date.toLocaleTimeString('en-US', options);
  } catch (e) {
    console.error("Time formatting error:", e);
    return "Error";
  }
};

// Get current date in YYYY-MM-DD format for Indian timezone
export const getCurrentIndianDate = () => {
  const now = new Date();
  const options = { timeZone: TIMEZONE };
  
  const year = now.toLocaleString('en-US', { year: 'numeric', ...options });
  const month = now.toLocaleString('en-US', { month: '2-digit', ...options });
  const day = now.toLocaleString('en-US', { day: '2-digit', ...options });
  
  return `${year}-${month}-${day}`;
};

// Get today's and yesterday's dates in IST - Fixed for correct date calculation
export const getIndianDates = () => {
  // Create a date object with the current time
  const now = new Date();
  
  // Format the date string explicitly for IST
  const istDateString = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  
  // Parse the IST date string to create a new date object in local timezone
  const nowInIST = new Date(istDateString);
  
  // Format today's date as YYYY-MM-DD
  const year = nowInIST.getFullYear();
  const month = String(nowInIST.getMonth() + 1).padStart(2, '0');
  const day = String(nowInIST.getDate()).padStart(2, '0');
  const todayFormatted = `${year}-${month}-${day}`;
  
  // Calculate yesterday's date
  const yesterdayInIST = new Date(nowInIST);
  yesterdayInIST.setDate(yesterdayInIST.getDate() - 1);
  
  // Format yesterday's date as YYYY-MM-DD
  const yYear = yesterdayInIST.getFullYear();
  const yMonth = String(yesterdayInIST.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterdayInIST.getDate()).padStart(2, '0');
  const yesterdayFormatted = `${yYear}-${yMonth}-${yDay}`;
  
  console.log("Today in IST:", todayFormatted);
  console.log("Yesterday in IST:", yesterdayFormatted);
  
  return {
    today: todayFormatted,
    yesterday: yesterdayFormatted
  };
};

// Check if a time is in the future (using IST)
export const isTimeInFutureIST = (dateTimeString) => {
  if (!dateTimeString) return false;
  
  try {
    // Get current time in IST
    const options = { timeZone: TIMEZONE };
    const nowInIST = new Date(new Date().toLocaleString('en-US', options));
    
    // Parse the input datetime
    const checkTime = new Date(dateTimeString);
    
    return checkTime > nowInIST;
  } catch (e) {
    console.error("Error checking future time:", e);
    return false;
  }
};
