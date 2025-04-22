import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, ChevronDown, ChevronUp, Calendar, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const MatkaResultsDashboard = () => {
  const [todaysResults, setTodaysResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});

  const API_URL = 'https://backend.matkasattadaily.com/api';
  
  const matkaTeamInfo = {
    "Desawar Matka": {
      description: "Start your day with the latest Desawar Matka results at 5:00 AM. Our platform provides real-time updates and accurate results to help you stay ahead.",
      tip: "Analyze the Desawar Matka chart to identify patterns and trends for better predictions."
    },
    "Delhi Bazar Matka": {
      description: "Get the Delhi Bazar Matka results at 3:00 PM every day. Our live updates ensure you never miss a result.",
      tip: "Follow the Delhi Bazar Matka chart to track historical results and predict future outcomes."
    },
    "Shri Ganesh Matka": {
      description: "Stay updated with the Shri Ganesh Matka results at 4:30 PM. Our platform offers live updates, daily charts, and expert tips to help you make the right decisions.",
      tip: "Use the Shri Ganesh Matka chart to analyze trends and improve your guessing accuracy."
    },
    "Faridabad Matka": {
      description: "The Faridabad Matka results are declared at 6:00 PM every day. Check our platform for live updates, daily charts, and expert tips.",
      tip: "Combine historical data with our expert tips for better predictions."
    },
    "Ghaziabad Matka": {
      description: "Get the latest Ghaziabad Matka results at 9:30 PM. Our platform provides real-time updates, daily charts, and expert tips to help you stay ahead.",
      tip: "Follow the Ghaziabad Matka chart to identify patterns and trends."
    },
    "Gali Matka": {
      description: "End your day with the Gali Matka results at 11:30 PM. Our platform offers live updates, daily charts, and expert tips to help you make informed decisions.",
      tip: "Use the Gali Matka chart to track historical results and improve your guessing accuracy."
    }
  };

  const normalizeTeamName = (teamName) => teamName.trim().toLowerCase();

  const normalizedMatkaTeamInfo = Object.keys(matkaTeamInfo).reduce((acc, key) => {
    acc[key.trim().toLowerCase()] = matkaTeamInfo[key];
    return acc;
  }, {});

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return "XX:XX";
    }
  };

  const toggleTeamExpansion = (team) => {
    setExpandedTeams(prev => ({
      ...prev,
      [team]: !prev[team]
    }));
  };

  const fetchTodaysResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      setCurrentDate(today.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }));

      const response = await axios.get(`${API_URL}/today`);
      const todayResults = response.data;

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

      const groupedResults = Object.entries(teamResults).map(([team, results]) => {
        const sortedResults = results.sort((a, b) => a.timestamp - b.timestamp);
        const normalizedTeam = normalizeTeamName(team);

        setExpandedTeams(prev => ({
          ...prev,
          [team]: true
        }));

        return {
          team,
          description: normalizedMatkaTeamInfo[normalizedTeam]?.description || "Stay updated with the latest results.",
          tip: normalizedMatkaTeamInfo[normalizedTeam]?.tip || "Check regularly for updates and follow trends.",
          results: sortedResults,
          upcomingCount: sortedResults.filter(r => r.upcoming).length,
          completedCount: sortedResults.filter(r => !r.upcoming).length
        };
      });

      setTodaysResults(groupedResults);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching today's results:", err);
      setError("Failed to load today's Matka data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysResults();
  }, [fetchTodaysResults]); // Add the dependency

  const handleRefresh = () => {
    fetchTodaysResults();
  };

  const getStatusBadge = (result) => (
    result.upcoming ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Upcoming</span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
    )
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Today's Matka Results</h1>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
        <div className="text-sm font-medium text-gray-500">
          {todaysResults.length > 0 ? `${todaysResults.length} teams with results today` : "No results scheduled"}
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

      {loading && (
        <div className="p-8 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <RefreshCw size={24} className="animate-spin text-red-600" />
            <span className="text-gray-600 font-medium">Loading Matka results...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="p-4">
          {todaysResults.length > 0 ? (
            <div className="space-y-4">
              {todaysResults.map((teamData, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div
                    className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 flex justify-between items-center cursor-pointer hover:from-gray-700 hover:to-gray-600 transition"
                    onClick={() => toggleTeamExpansion(teamData.team)}
                  >
                    <div className="font-bold text-lg">{teamData.team}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-xs bg-opacity-20 bg-white px-2 py-1 rounded-full">
                        <span className="font-medium">{teamData.upcomingCount}</span> upcoming • <span className="font-medium">{teamData.completedCount}</span> completed
                      </div>
                      {expandedTeams[teamData.team] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {expandedTeams[teamData.team] && (
                    <div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-700">{teamData.description}</p>
                      </div>
                      <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
                        <p className="text-sm text-yellow-800">
                          <span className="font-bold">Pro Tip:</span> {teamData.tip}
                        </p>
                      </div>
                      {teamData.results.map((result, idx) => (
                        <div key={idx} className={`p-4 flex justify-between items-center ${result.upcoming ? "bg-blue-50" : "bg-white"}`}>
                          <div className="flex items-center space-x-3">
                            <Clock size={16} className="text-gray-400" />
                            <span className="font-medium">{result.time}</span>
                            {getStatusBadge(result)}
                          </div>
                          <div className="text-xl font-bold">
                            {result.upcoming ? <span className="text-gray-400">--</span> : <span className="text-gray-800">{result.result}</span>}
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
              <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results today</h3>
              <p className="mt-1 text-sm text-gray-500">There are no Matka results scheduled for today.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatkaResultsDashboard;
