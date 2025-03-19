import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';

const Home = () => {
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

  // API URL
  const API_URL = 'http://localhost:5500/api';

  // Fetch teams data
  useEffect(() => {

    const fetchTeams = async () => {
      try {
        setLoading(true);
        // Get all teams
        const teamsResponse = await axios.get(`${API_URL}/teams`);
        alert("teamsResponse");

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
        const todayResultsResponse = await axios.get(`${API_URL}/today`);
        
        // Get yesterday's results for each team
        const yesterdayResultsPromises = teamsResponse.data.map(team => 
          axios.get(`${API_URL}/results?team=${team.name}&date=${yesterdayFormatted}`)
            .then(response => response.data)
            .catch(() => null) // If no result, return null
        );
        
        const yesterdayResults = await Promise.all(yesterdayResultsPromises);
        
        // Combine team data with results
        const teamsWithResults = teamsResponse.data.map((team, index) => {
          const results = {};
          
          // Add yesterday's result if available
          if (yesterdayResults[index]) {
            results[yesterdayFormatted] = yesterdayResults[index].result;
          }
          
            // Add today's result if available
            const todayResult = todayResultsResponse.data.find(r => r.team === team.name);
            if (todayResult) {
            console.log("test 1: " + todayResult.visible_result);
            results[todayFormatted] = todayResult.visible_result;
            }

            // Extract time from today's result or use default
            let time = "XX:XX";
            if (todayResult && todayResult.result_time) {
            const resultTime = new Date(todayResult.result_time);
            time = resultTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
            }
          
          return {
            id: team.id,
            name: team.name,
            time: time,
            results: results
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
    
    fetchTeams();
    
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
      
      const response = await axios.post(`${API_URL}/results/monthly`, {
        team: team.name,
        month: `${year}-${month.toString().padStart(2, '0')}`
      });
      
      setSelectedTeam({
        ...team,
        chartData: response.data
      });
      
      setShowChartView(true);
      setShowCalendar(false);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to load chart data. Please try again later.");
      setLoading(false);
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
        let teamResults = {};
        
        if (dayData && dayData.results.length > 0) {
          dayData.results.forEach(result => {
            teamResults[result.team] = result.visible_result;
          });
        }
        
        calendarDays.push({
          day: i,
          date: dateStr,
          results: teamResults
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

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="w-full bg-gray-100 p-4 text-center">
        {/* Header */}
        <h1 className="text-3xl font-bold text-black uppercase">SATTA-KING-FAST.com</h1>
        
        {/* Advertisement Banner */}
        <div className="mt-4 flex justify-center items-center">
          <img 
            src="/api/placeholder/800/120" 
            alt="Advertisement" 
            className="w-full max-w-4xl" 
          />
        </div>
        
        {/* Informational Text */}
        <p className="mt-4 text-gray-700 text-sm p-1 w-full lg:w-3/4 m-auto">
          Delhi Diamond Satta Result And Monthly Satta Chart of March 2025 With Combined Chart of Gali, Desawar, Ghaziabad, Faridabad And Shri Ganesh from Satta King Fast, Satta King Result, Satta King Chart, Black Satta King and Satta King 786.
        </p>
        
        {/* Disclaimer */}
        <p className="mt-2 text-blue-600 text-sm font-medium bg-white p-1 w-full lg:w-3/4 m-auto">
          Satta-King-Fast.com is the most popular gaming discussion forum for players to use freely and we are not in partnership with any gaming company.
        </p>
        
        {/* Warning Message */}
        <p className="mt-2 text-red-600 font-bold bg-white p-1 w-full lg:w-3/4 m-auto">
          कृपया ध्यान दें, लीक गेम के नाम पर किसी को कोई पैसा न दें, ना पहले ना बाद में - धन्यवाद
        </p>
        
        {/* Contact Link */}
        <p className="mt-2 text-green-600 font-medium bg-white p-1 w-full lg:w-3/4 m-auto">
          हमसे संपर्क करने के लिए ➡ <a href="#" className="underline">यहाँ क्लिक करें</a>
        </p>
        
        {/* Timestamp */}
        <p className="mt-2 text-gray-600 text-xs">
          Updated: {currentTime} IST.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-emerald-400 p-4 text-white text-center text-xl font-bold rounded-t-lg">
          {teams.length > 0 && teams[0].name} Satta Result of {dates.length > 1 && new Date(dates[1]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} & {dates.length > 0 && new Date(dates[0]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        
        {/* Controls */}
        <div className="bg-white p-4 mb-4 flex justify-between items-center">
          <div className="text-lg font-semibold">Latest Results</div>
          
          <div className="flex gap-2">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={handleCalendarView}
              disabled={loading}
            >
              <Calendar size={16} />
              Calendar View
            </button>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
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
              <RefreshCw size={24} className="animate-spin text-blue-500" />
              <span>Loading data...</span>
            </div>
          </div>
        )}
        
        {/* Chart View */}
        {!loading && showChartView && selectedTeam && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Monthly Chart: {selectedTeam.name}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTeam.chartData && selectedTeam.chartData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border p-2">{new Date(item.result_date).toLocaleDateString()}</td>
                      <td className="border p-2 text-right font-bold">{item.result}</td>
                    </tr>
                  ))}
                  {(!selectedTeam.chartData || selectedTeam.chartData.length === 0) && (
                    <tr>
                      <td colSpan="2" className="border p-2 text-center">No chart data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowChartView(false)}
              >
                Back to Results
              </button>
            </div>
          </div>
        )}
        
        {/* Calendar View */}
        {!loading && showCalendar && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <button 
                className="bg-gray-200 p-2 rounded"
                onClick={() => handleMonthChange(-1)}
              >
                Previous Month
              </button>
              
              <h2 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button 
                className="bg-gray-200 p-2 rounded"
                onClick={() => handleMonthChange(1)}
              >
                Next Month
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day, index) => (
                <div key={index} className={`border rounded p-2 min-h-16 ${day ? 'bg-white' : ''}`}>
                  {day && (
                    <>
                      <div className="text-right text-sm text-gray-500">{day.day}</div>
                      {teams.map(team => (
                        <div key={team.id} className="text-xs mt-1">
                          {day.results[team.name] && (
                            <>
                              <span className="font-semibold">{team.name.split(' ')[0]}:</span> {day.results[team.name]}
                            </>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowCalendar(false)}
              >
                Back to Results
              </button>
            </div>
          </div>
        )}
        
        {/* Teams Table */}
        {!loading && !showCalendar && !showChartView && (
          <div className="bg-white rounded-b-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
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
                      <div className="font-semibold">{team.name}</div>
                      <div className="text-sm text-gray-500">at {team.time}</div>
                      <div className="text-xs text-blue-500 underline mt-1 cursor-pointer" onClick={() => handleViewChart(team)}>Record Chart</div>
                    </td>
                    <td className="p-3 text-center text-2xl font-bold">{dates.length > 0 && team.results[dates[0]] || 'XX'}</td>
                    <td className="p-3 text-center text-2xl font-bold">{dates.length > 1 && team.results[dates[1]] || 'XX'}</td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <button 
                          className="p-2 bg-green-100 text-green-600 rounded"
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
            
            <div className="bg-gray-700 text-white text-center p-3">
              <button className="hover:underline" onClick={handleCalendarView}>Click here for all games results.</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;