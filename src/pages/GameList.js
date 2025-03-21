import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, RefreshCw, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import TodaysMatch from './TodaysMatch';
import Today from './Today';
import Header from './Header';
import Footer from './Footer';
import { 
  formatTimeIST, 
  formatResult, 
  getIndianDates,
  isTimeInFutureIST,
  formatDateIST,
  TIMEZONE
} from '../utils/dateUtils';

const GameList = () => {
  const [teams, setTeams] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showChartView, setShowChartView] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  // API URL
  const API_URL = 'http://localhost:5500/api';

  // Format time using IST
  const formatTime = (timeString) => {
    return formatTimeIST(timeString);
  };

  // Check if a match is upcoming using IST
  const isUpcoming = (resultTime) => {
    return isTimeInFutureIST(resultTime);
  };

  // Fetch teams data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get all teams
        const teamsResponse = await axios.get(`${API_URL}/teams`);

        // Get today's and yesterday's dates in IST
        const { today: todayFormatted, yesterday: yesterdayFormatted } = getIndianDates();

        // Set dates for display
        setDates([yesterdayFormatted, todayFormatted]);

        // Get today's results
        const todayResultsResponse = await axios.get(`${API_URL}/results/daily?date=${todayFormatted}`);
        const todayResults = todayResultsResponse.data;

        // Get yesterday's results
        const yesterdayResultsResponse = await axios.get(`${API_URL}/results/daily?date=${yesterdayFormatted}`);
        const yesterdayResults = yesterdayResultsResponse.data;

        // Process upcoming matches
        const upcoming = todayResults.filter(result => isUpcoming(result.result_time));
        setUpcomingMatches(upcoming);

        // Combine team data with results
        const teamsWithResults = teamsResponse.data.map(team => {
          // Get all results for this team
          const yesterdayTeamResults = yesterdayResults.filter(r => r.team === team.name);
          const todayTeamResults = todayResults.filter(r => r.team === team.name);

          // Create result arrays for both days
          const yesterdayResultsArr = yesterdayTeamResults.map(r => ({
            result: r.visible_result,
            time: formatTime(r.result_time),
            isPending: r.visible_result === '-1'
          }));

          const todayResultsArr = todayTeamResults
            .filter(r => !isUpcoming(r.result_time))
            .map(r => ({
              result: r.visible_result,
              time: formatTime(r.result_time),
              isPending: r.visible_result === '-1'
            }));

          // Extract latest scheduled time
          let latestTime = "XX:XX";
          const latestTodayResult = todayTeamResults
            .sort((a, b) => new Date(b.result_time) - new Date(a.result_time))
            .find(r => r.result_time);

          if (latestTodayResult) {
            latestTime = formatTime(latestTodayResult.result_time);
          }

          return {
            id: team.id,
            name: team.name,
            time: latestTime,
            results: {
              [yesterdayFormatted]: yesterdayResultsArr,
              [todayFormatted]: todayResultsArr
            }
          };
        });

        setTeams(teamsWithResults);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load team data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();

    // Update current time every minute using IST
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleString("en-IN", { timeZone: TIMEZONE });
      setCurrentTime(formattedTime);
    }, 60000);

    // Set initial time in IST
    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", { timeZone: TIMEZONE });
    setCurrentTime(formattedTime);

    return () => clearInterval(interval);
  }, []);

  // Show chart for selected team
const handleViewChart = async (team) => {
  try {
    setLoading(true);
    
    // Get current date in IST
    const options = { timeZone: TIMEZONE };
    const currentDateIST = new Date(new Date().toLocaleString('en-US', options));
    const month = currentDateIST.getMonth() + 1;
    const year = currentDateIST.getFullYear();
    
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    console.log("Fetching chart data for:", team.name, "Month:", monthStr);
    
    const response = await axios.post(`${API_URL}/results/monthly`, {
      team: team.name,
      month: monthStr
    });
    
    console.log("API Response:", response.data);
    
    // Process the data to ensure date parts are available
    const processedData = response.data.map(item => ({
      ...item,
      // Extract date part from result_time for display
      result_date: item.result_time ? item.result_time.split(' ')[0] : null,
      // Use visible_result as the result (may be named differently in API response)
      result: item.visible_result || item.result || '-'
    }));
    
    setSelectedTeam({
      ...team,
      chartData: processedData
    });
    
    setShowChartView(true);
    setShowCalendar(false);
    setLoading(false);
  } catch (err) {
    console.error("Error fetching chart data:", err);
    setError("Failed to load chart data: " + (err.response?.data?.message || err.message));
    setLoading(false);
    setShowChartView(false);
  }
};

  // Load calendar data
  const loadCalendarData = async (year, month) => {
    try {
      setLoading(true);

      // Calculate first and last day of month
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Get results for each day in the month
      const dailyResultsPromises = [];
      const currentDate = new Date(year, month, 1);
      const lastDate = new Date(year, month + 1, 0);

      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        dailyResultsPromises.push(
          axios.get(`${API_URL}/results/daily?date=${dateString}`)
            .then(response => ({
              date: dateString,
              results: response.data
            }))
            .catch(() => ({
              date: dateString,
              results: []
            }))
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const allResults = await Promise.all(dailyResultsPromises);

      // Format calendar data
      const calendarDays = [];
      const firstDayOfMonth = new Date(year, month, 1);
      const firstDayWeekday = firstDayOfMonth.getDay();

      // Add empty cells for days before the first of the month
      for (let i = 0; i < firstDayWeekday; i++) {
        calendarDays.push(null);
      }

      // Add days with results
      for (let i = 1; i <= lastDate.getDate(); i++) {
        const dateObj = new Date(year, month, i);
        const dateStr = dateObj.toISOString().split('T')[0];

        const dayData = allResults.find(r => r.date === dateStr);
        let dayResults = [];

        if (dayData && dayData.results.length > 0) {
          // Group by team
          const teamResults = {};

          dayData.results.forEach(result => {
            if (!teamResults[result.team]) {
              teamResults[result.team] = [];
            }
            teamResults[result.team].push({
              result: result.visible_result,
              time: formatTime(result.result_time)
            });
          });

          // Create an array for display
          dayResults = Object.entries(teamResults).map(([team, results]) => ({
            team,
            results
          }));
        }

        calendarDays.push({
          day: i,
          date: dateStr,
          results: dayResults
        });
      }

      setCalendarData(calendarDays);
      setLoading(false);
    } catch (err) {
      console.error("Error loading calendar data:", err);
      setError("Failed to load calendar data. Please try again later.");
      setLoading(false);
    }
  };

  // Handle calendar view button click
  const handleCalendarView = () => {
    const now = new Date();
    setCurrentMonth(now);
    loadCalendarData(now.getFullYear(), now.getMonth());
    setShowCalendar(true);
    setShowChartView(false);
  };

  // Handle month change in calendar
  const handleMonthChange = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
    loadCalendarData(newMonth.getFullYear(), newMonth.getMonth());
  };

  // Refresh data
  const handleRefresh = () => {
    window.location.reload();
  };

  // Format date for display using IST with timezone correction
const formatDate = (dateString) => {
  try {
    if (!dateString) return "";

    // Parse the YYYY-MM-DD date string
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create date in local timezone (will be converted to IST in formatter)
    const date = new Date(year, month - 1, day);
    
    // Format with IST timezone
    return date.toLocaleDateString('en-US', {
      timeZone: TIMEZONE,
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

  return (
    <div className="bg-gray-200 min-h-screen">
      <Header/>
  

      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        <Today/>

        <div className="bg-red-600 p-4 text-white text-center text-xl font-bold rounded-t-lg shadow-lg">
           Satta Result of {dates.length > 1 && formatDate(dates[1])} & {dates.length > 0 && formatDate(dates[0])}
        </div>

        {/* Controls */}
        <div className="bg-white p-4 mb-4 flex flex-col md:flex-row justify-between items-center shadow-md">
          <div className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">Latest Results</div>

          <div className="flex gap-2">
            {/* <button
              className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800 transition"
              onClick={handleCalendarView}
              disabled={loading}
            >
              <Calendar size={16} />
              Calendar View
            </button> */}
            <button
              className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="bg-white p-8 mb-4 rounded shadow flex justify-center items-center">
            <div className="flex items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-red-600" />
              <span>Loading data...</span>
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {!loading && upcomingMatches.length > 0 && !showChartView && !showCalendar && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
              <Clock size={20} />
              Upcoming Matches Today
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-300 p-2 text-left">Team</th>
                    <th className="border border-gray-300 p-2 text-center">Scheduled Time</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingMatches.map((match, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 p-2 font-medium">{match.team}</td>
                      <td className="border border-gray-300 p-2 text-center">{formatTime(match.result_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chart View */}
        {!loading && showChartView && selectedTeam && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Monthly Chart: {selectedTeam.name}</h2>
            <div className="overflow-x-auto"> 
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-300 p-2 text-left">Date</th>
                    <th className="border border-gray-300 p-2 text-center">Time</th>
                    <th className="border border-gray-300 p-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTeam.chartData && selectedTeam.chartData.length > 0 ? (
                    selectedTeam.chartData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-2">
                          {item.result_date ? new Date(item.result_date).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {item.result_time ? formatTime(item.result_time) : "N/A"}
                        </td>
                        <td className="border border-gray-300 p-2 text-right font-bold">
                          {formatResult(item.result)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="border border-gray-300 p-2 text-center">No chart data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                onClick={() => setShowChartView(false)}
              >
                Back to Results
              </button>
            </div>
          </div>
        )}

        {/* Calendar View - Improved Responsive Design */}
        {!loading && showCalendar && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <button
                className="bg-black text-white p-2 rounded flex items-center gap-1 hover:bg-gray-800 transition"
                onClick={() => handleMonthChange(-1)}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <h2 className="text-lg font-semibold text-red-600">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>

              <button
                className="bg-black text-white p-2 rounded flex items-center gap-1 hover:bg-gray-800 transition"
                onClick={() => handleMonthChange(1)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold bg-gray-800 text-white p-1 text-xs sm:text-sm">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`border rounded p-1 overflow-y-auto ${day ? 'bg-white' : 'bg-gray-100'
                    }`}
                  style={{
                    height: "120px",
                    maxHeight: "120px"
                  }}
                >
                  {day && (
                    <>
                      <div className={`text-right text-sm font-medium ${new Date().toISOString().split('T')[0] === day.date ?
                          'bg-red-600 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center ml-auto' :
                          'text-gray-700'
                        }`}>
                        {day.day}
                      </div>
                      <div className="overflow-y-auto" style={{ maxHeight: "90px" }}>
                        {day.results.length > 0 ? (
                          day.results.map((teamResult, i) => (
                            <div key={i} className="mt-1 border-t border-gray-200 pt-1">
                              <div className="font-semibold text-xs text-red-600">{teamResult.team}</div>
                              {teamResult.results.map((r, j) => (
                                <div key={j} className="text-xs flex justify-between">
                                  <span className="text-gray-500">{r.time}</span>
                                  <span className={`font-bold ${r.result === '-1' ? 'text-gray-500' : ''}`}>
                                    {formatResult(r.result)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 mt-2 text-center">No results</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                onClick={() => setShowCalendar(false)}
              >
                Back to Results
              </button>
            </div>
          </div>
        )}

        {/* Teams Table with multiple results support */}
        {!loading && !showCalendar && !showChartView && (
          <div className="bg-white rounded-b-lg overflow-hidden shadow-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-3 text-left">Games List</th>
                  <th className="p-3 text-center">
                    {dates.length > 0 && formatDate(dates[0])}
                  </th>
                  <th className="p-3 text-center">
                    {dates.length > 1 && formatDate(dates[1])}
                  </th>
                  <th className="p-3 text-center">Chart</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-red-600">{team.name}</div>
                      <div className="text-sm text-gray-500">at {team.time}</div>
                      <div className="text-xs text-black underline mt-1 cursor-pointer hover:text-red-600" onClick={() => handleViewChart(team)}>Record Chart</div>
                    </td>

                    <td className="p-3 text-center">
                      {dates.length > 0 && team.results[dates[0]] && team.results[dates[0]].length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {team.results[dates[0]].map((result, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className={`text-2xl font-bold ${result.isPending ? 'text-gray-500' : ''}`}>
                                {formatResult(result.result)}
                              </span>
                              <span className="text-xs text-gray-500">{result.time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">XX</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {dates.length > 1 && team.results[dates[1]] && team.results[dates[1]].length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {team.results[dates[1]].map((result, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className={`text-2xl font-bold ${result.isPending ? 'text-gray-500' : ''}`}>
                                {formatResult(result.result)}
                              </span>
                              <span className="text-xs text-gray-500">{result.time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-400">XX</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-center">
                        <button
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          onClick={() => handleViewChart(team)}
                          title="View Monthly Chart"
                        >
                          <BarChart2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center">No teams found</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="bg-black text-white text-center p-3">
              <button className="hover:text-red-400 transition" onClick={handleCalendarView}>Click here for all games results.</button>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default GameList;