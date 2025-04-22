import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, RefreshCw, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import TodaysMatch from './TodaysMatch';
import Today from './Today';
import Header from './Header';
import Footer from './Footer';

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
  const API_URL = 'https://backend.matkasattadaily.com/api';

  // Format time
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return "XX:XX";
    }
  };

  // Check if a match is upcoming
  const isUpcoming = (resultTime) => {
    try {
      const now = new Date();
      const matchTime = new Date(resultTime);
      return matchTime > now;
    } catch (e) {
      return false;
    }
  };

  // Fetch teams data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get all teams
        const teamsResponse = await axios.get(`${API_URL}/teams`);
        
        // Handle the specific error case where the API returns an error message
        if (teamsResponse.data && teamsResponse.data.error === "No teams found.") {
          console.log("API returned: No teams found");
          setError("No teams data is currently available. Please try again later.");
          setTeams([]);
        } 
        else if (Array.isArray(teamsResponse.data)) {
          // Get today's date and format it
          const today = new Date();
          const todayFormatted = today.toISOString().split('T')[0];

          // Get yesterday's date and format it
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayFormatted = yesterday.toISOString().split('T')[0];

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
              time: formatTime(r.result_time)
            }));

            const todayResultsArr = todayTeamResults
              .filter(r => !isUpcoming(r.result_time))
              .map(r => ({
                result: r.visible_result,
                time: formatTime(r.result_time)
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
        } else {
          console.error("Error: teamsResponse.data is not an array", teamsResponse.data);
          setError(`Failed to load team data: Invalid data format received from server. Expected an array but got ${typeof teamsResponse.data}.`);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load team data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Update current time every minute
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      setCurrentTime(formattedTime);
    }, 60000);

    // Set initial time
    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    setCurrentTime(formattedTime);

    return () => clearInterval(interval);
  }, []);

  // Show chart for selected team
  const handleViewChart = async (team) => {
    try {
      setLoading(true);
      // Get monthly results for the selected team
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

      console.log("Fetching chart data for:", team.name, "Month:", monthStr);

      const response = await axios.post(`${API_URL}/results/monthly`, {
        team: team.name,
        month: monthStr
      });

      console.log("API Response:", response.data);

      // Process data to group by date - handle multiple results per day
      const processedData = [];
      const resultsMap = new Map();

      if (Array.isArray(response.data)) {
        // Group results by date
        response.data.forEach(item => {
          if (!item.result_date) return;

          const dateKey = new Date(item.result_date).toISOString().split('T')[0];

          if (!resultsMap.has(dateKey)) {
            resultsMap.set(dateKey, []);
          }

          resultsMap.get(dateKey).push({
            result_date: item.result_date,
            result_time: item.result_time,
            result: item.visible_result || item.result
          });
        });

        // Convert map to array and sort by date
        resultsMap.forEach((dayResults, dateKey) => {
          // Sort results by time for each day
          dayResults.sort((a, b) => new Date(a.result_time) - new Date(b.result_time));

          // Add each result to the processed data
          dayResults.forEach(result => {
            processedData.push(result);
          });
        });

        // Sort the final array by date
        processedData.sort((a, b) => new Date(a.result_date) - new Date(b.result_date));
      }

      // Keep the original data structure but use processed data
      setSelectedTeam({
        ...team,
        chartData: processedData.length > 0 ? processedData : response.data
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

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group chart data by date for display
  const getGroupedChartData = () => {
    if (!selectedTeam || !selectedTeam.chartData || !Array.isArray(selectedTeam.chartData)) {
      return [];
    }

    const groupedData = new Map();

    selectedTeam.chartData.forEach(item => {
      if (!item.result_date) return;

      const dateKey = new Date(item.result_date).toISOString().split('T')[0];

      if (!groupedData.has(dateKey)) {
        groupedData.set(dateKey, []);
      }

      groupedData.get(dateKey).push(item);
    });

    return groupedData;
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        <Today />

        <div className="bg-red-600 p-4 text-white text-center text-xl font-bold rounded-t-lg shadow-lg">
          Satta Result of {dates.length > 1 && formatDate(dates[1])} & {dates.length > 0 && formatDate(dates[0])}
        </div>

        {/* Controls */}
        <div className="bg-white p-4 mb-4 flex flex-col md:flex-row justify-between items-center shadow-md">
          <div className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">Latest Results</div>

          <div className="flex gap-2">
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

        {/* Chart View - FIXED TO HANDLE MULTIPLE RESULTS PER DAY */}
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
                          {item.result_time ? new Date(item.result_time).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {item.result_time ? formatTime(item.result_time) : "N/A"}
                        </td>
                        <td className="border border-gray-300 p-2 text-right font-bold">
                          {item.visible_result === '-1' || item.result === '-1'
                            ? "Yet to Announce"
                            : (item.visible_result || item.result || "N/A")
                          }
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
                                  <span className="font-bold">{r.result}</span>
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
                    {dates.length > 0 && new Date(dates[0]).toLocaleDateString('en-US', { weekday: 'short' })} {dates.length > 0 && new Date(dates[0]).getDate()}th
                  </th>
                  <th className="p-3 text-center">
                    {dates.length > 1 && new Date(dates[1]).toLocaleDateString('en-US', { weekday: 'short' })} {dates.length > 1 && new Date(dates[1]).getDate()}th
                  </th>
                  <th className="p-3 text-center">Chart</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-red-600">{team.name}</div>
                      <div className="text-xs text-black underline mt-1 cursor-pointer hover:text-red-600" onClick={() => handleViewChart(team)}>Record Chart</div>
                    </td>

                    <td className="p-3 text-center">
                      {dates.length > 0 && team.results[dates[0]] && team.results[dates[0]].length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {team.results[dates[0]].map((result, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-2xl font-bold">{result.result}</span>
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
                              <span className="text-2xl font-bold">{result.result}</span>
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
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg ">
        {/* Section 7 */}
        <section className="mb-10">
          <div className="border-l-4 border-red-600 pl-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Expert Matka Satta Daily Tips for 2025</h2>
          </div>

          <div className="mt-4 bg-gray-50 p-6 rounded-lg">
            <p className="mb-3">Here are some expert tips to improve your Matka Satta game:</p>

            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
                <span><strong>Follow the Charts:</strong> Use daily charts to identify patterns and trends.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
                <span><strong>Analyze Historical Data:</strong> Study past results to predict future outcomes.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
                <span><strong>Use Expert Tips:</strong> Follow our daily tips and strategies for better results.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">4</span>
                <span><strong>Stay Updated:</strong> Check our platform for live updates and accurate results.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Divider */}
        <hr className="my-8 border-gray-200" />

        {/* Section 8 */}
        <section className="mb-10">
          <div className="border-l-4 border-red-600 pl-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Matka Satta Daily Chart for 2025</h2>
          </div>

          <div className="mt-4 bg-gray-50 p-6 rounded-lg">
            <p className="leading-relaxed">
              Our <strong className="text-green-600">Matka Satta daily chart</strong> provides historical data and trends
              for all major games, including Desawar, Delhi Bazar, Shri Ganesh, Faridabad, Ghaziabad,
              and Gali Matka. Use the chart to improve your guessing accuracy and win more often.
            </p>

            {/* Sample chart preview */}
            <div className="mt-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Popular Matka Games</h3>
                <span className="text-sm text-gray-500">Last Updated: March 24, 2025</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {["Desawar", "Delhi Bazar", "Shri Ganesh", "Faridabad", "Ghaziabad", "Gali Matka"].map((game) => (
                  <div key={game} className="p-3 bg-blue-50 rounded border border-blue-100 text-center">
                    <p className="font-medium text-blue-700">{game}</p>
                    {/* <p className="text-sm text-gray-600 mt-1">View Chart</p> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="my-8 border-gray-200" />

        {/* Conclusion */}
        {/* <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Conclusion</h2>
          <p className="leading-relaxed">
            At <strong>Matka Satta Daily.com</strong>, we provide accurate results, expert tips, and daily charts
            for all major Matka games. Whether you're looking for Desawar Matka results at 5:00 AM or
            Gali Matka results at 11:30 PM, we've got you covered. Stay ahead of the game with our
            live updates and expert strategies.
          </p>

        </section> */}
      </div>
      <br></br>
      <Footer />
    </div>
  );
};

export default GameList;