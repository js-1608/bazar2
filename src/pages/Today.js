import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import axios from 'axios';

const Today = () => {
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});

  // API URL
  const API_URL = 'http://localhost:5500/api';

  // Format time
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return "XX:XX";
    }
  };

  // Toggle team expansion
  const toggleTeamExpansion = (team) => {
    setExpandedTeams(prev => ({
      ...prev,
      [team]: !prev[team]
    }));
  };

  // Fetch today's matches
  useEffect(() => {
    const fetchTodaysMatches = async () => {
      try {
        setLoading(true);
        
        // Get today's date for display
        const today = new Date();
        setCurrentDate(today.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }));
        
        // Get today's results
        const todayResultsResponse = await axios.get(`${API_URL}/today`);
        const todayResults = todayResultsResponse.data;
        
        // Group by team
        const teamResults = {};
        
        todayResults.forEach(result => {
          if (!teamResults[result.team]) {
            teamResults[result.team] = [];
          }
          teamResults[result.team].push({
            result: result.visible_result,
            time: formatTime(result.result_time),
            timestamp: new Date(result.result_time),
            upcoming: new Date(result.result_time) > new Date()
          });
        });
        
        // Convert to array for display and initialize expanded state
        const groupedResults = Object.entries(teamResults).map(([team, results]) => {
          // Sort by time
          const sortedResults = results.sort((a, b) => a.timestamp - b.timestamp);
          
          // Set all teams expanded by default
          setExpandedTeams(prev => ({
            ...prev,
            [team]: true
          }));
          
          return {
            team,
            results: sortedResults,
            upcomingCount: sortedResults.filter(r => r.upcoming).length,
            completedCount: sortedResults.filter(r => !r.upcoming).length
          };
        });
        
        setTodaysMatches(groupedResults);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching today's matches:", err);
        setError("Failed to load today's match data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchTodaysMatches();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        // Get today's results
        const todayResultsResponse = await axios.get(`${API_URL}/today`);
        const todayResults = todayResultsResponse.data;
        
        // Group by team
        const teamResults = {};
        
        todayResults.forEach(result => {
          if (!teamResults[result.team]) {
            teamResults[result.team] = [];
          }
          teamResults[result.team].push({
            result: result.visible_result,
            time: formatTime(result.result_time),
            timestamp: new Date(result.result_time),
            upcoming: new Date(result.result_time) > new Date()
          });
        });
        
        // Convert to array for display
        const groupedResults = Object.entries(teamResults).map(([team, results]) => {
          // Sort by time
          const sortedResults = results.sort((a, b) => a.timestamp - b.timestamp);
          
          return {
            team,
            results: sortedResults,
            upcomingCount: sortedResults.filter(r => r.upcoming).length,
            completedCount: sortedResults.filter(r => !r.upcoming).length
          };
        });
        
        setTodaysMatches(groupedResults);
        setLoading(false);
      } catch (err) {
        setError("Failed to refresh match data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  };

  // Get status badge
  const getStatusBadge = (result) => {
    if (result.upcoming) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Upcoming
        </span>
      );
    }
    
    // You could add logic here to style different results differently
    // For example, showing wins in green, losses in red
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Today's Matches</h1>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{currentDate}</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
        <div className="text-sm font-medium text-gray-500">
          {todaysMatches.length > 0 ? 
            `${todaysMatches.length} teams with matches today` : 
            "No matches scheduled"}
        </div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="p-8 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-red-600" />
            <span className="text-gray-600 font-medium">Loading match data...</span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Results display */}
      {!loading && !error && (
        <div className="p-4">
          {todaysMatches.length > 0 ? (
            <div className="space-y-4">
              {todaysMatches.map((teamData, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Team header - clickable to expand/collapse */}
                  <div 
                    className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 flex justify-between items-center cursor-pointer hover:from-gray-700 hover:to-gray-600 transition"
                    onClick={() => toggleTeamExpansion(teamData.team)}
                  >
                    <div className="font-bold text-lg">{teamData.team}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-xs bg-opacity-20 bg-white px-2 py-1 rounded-full">
                        <span className="font-medium">{teamData.upcomingCount}</span> upcoming • <span className="font-medium">{teamData.completedCount}</span> completed
                      </div>
                      {expandedTeams[teamData.team] ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                  
                  {/* Team results */}
                  {expandedTeams[teamData.team] && (
                    <div className="divide-y divide-gray-100">
                      {teamData.results.map((result, idx) => (
                        <div key={idx} className={`p-4 flex justify-between items-center ${result.upcoming ? "bg-blue-50" : "bg-white"}`}>
                          <div className="flex items-center space-x-3">
                            <Clock size={16} className="text-gray-400" />
                            <span className="font-medium">{result.time}</span>
                            {getStatusBadge(result)}
                          </div>
                          <div className="text-xl font-bold">
                            {result.upcoming ? (
                              <span className="text-gray-400">--</span>
                            ) : (
                              <span className="text-gray-800">{result.result}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No matches today</h3>
              <p className="mt-1 text-sm text-gray-500">There are no matches scheduled for today.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Today;