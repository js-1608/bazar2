import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, ChevronDown, ChevronUp, Calendar, AlertTriangle } from 'lucide-react';

const MatkaResultsDashboard = () => {
  const [todaysResults, setTodaysResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});

  // Matka teams and their scheduled times
  const matkaTeams = [
    {
      team: "Desawar Matka",
      time: "5:00 AM",
      description: "Start your day with the latest Desawar Matka results at 5:00 AM. Our platform provides real-time updates and accurate results to help you stay ahead.",
      tip: "Analyze the Desawar Matka chart to identify patterns and trends for better predictions."
    },
    {
      team: "Delhi Bazar Matka",
      time: "3:00 PM",
      description: "Get the Delhi Bazar Matka results at 3:00 PM every day. Our live updates ensure you never miss a result.",
      tip: "Follow the Delhi Bazar Matka chart to track historical results and predict future outcomes."
    },
    {
      team: "Shri Ganesh Matka",
      time: "4:30 PM",
      description: "Stay updated with the Shri Ganesh Matka results at 4:30 PM. Our platform offers live updates, daily charts, and expert tips to help you make the right decisions.",
      tip: "Use the Shri Ganesh Matka chart to analyze trends and improve your guessing accuracy."
    },
    {
      team: "Faridabad Matka",
      time: "6:00 PM", 
      description: "The Faridabad Matka results are declared at 6:00 PM every day. Check our platform for live updates, daily charts, and expert tips.",
      tip: "Combine historical data with our expert tips for better predictions."
    },
    {
      team: "Ghaziabad Matka",
      time: "9:30 PM",
      description: "Get the latest Ghaziabad Matka results at 9:30 PM. Our platform provides real-time updates, daily charts, and expert tips to help you stay ahead.",
      tip: "Follow the Ghaziabad Matka chart to identify patterns and trends."
    },
    {
      team: "Gali Matka",
      time: "11:30 PM",
      description: "End your day with the Gali Matka results at 11:30 PM. Our platform offers live updates, daily charts, and expert tips to help you make informed decisions.",
      tip: "Use the Gali Matka chart to track historical results and improve your guessing accuracy."
    }
  ];

  // Format time
  const formatTime = (timeString) => {
    return timeString;
  };

  // Toggle team expansion
  const toggleTeamExpansion = (team) => {
    setExpandedTeams(prev => ({
      ...prev,
      [team]: !prev[team]
    }));
  };

  // Generate mock results based on current time
  useEffect(() => {
    const generateMockResults = () => {
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
        
        // Generate mock results for each team
        const results = matkaTeams.map(teamData => {
          // Parse the time
          const [hours, minutes] = teamData.time.split(':');
          const ampm = teamData.time.includes('PM') ? 'PM' : 'AM';
          const hour = parseInt(hours) + (ampm === 'PM' && parseInt(hours) !== 12 ? 12 : 0);
          
          // Create timestamp for today with the result time
          const resultTime = new Date();
          resultTime.setHours(hour, parseInt(minutes), 0);
          
          // Generate random result for completed games
          const isUpcoming = resultTime > today;
          const result = isUpcoming ? null : `${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10)}`;
          
          return {
            team: teamData.team,
            results: [{
              result,
              time: teamData.time,
              timestamp: resultTime,
              upcoming: isUpcoming,
              description: teamData.description,
              tip: teamData.tip
            }],
            upcomingCount: isUpcoming ? 1 : 0,
            completedCount: isUpcoming ? 0 : 1
          };
        });
        
        // Set all teams expanded by default
        const expandedState = {};
        matkaTeams.forEach(team => {
          expandedState[team.team] = true;
        });
        setExpandedTeams(expandedState);
        
        setTodaysResults(results);
        setLoading(false);
      } catch (err) {
        console.error("Error generating mock results:", err);
        setError("Failed to load today's match data. Please try again later.");
        setLoading(false);
      }
    };
    
    generateMockResults();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    // Generate new mock results
    setTimeout(() => {
      const today = new Date();
      
      // Update results - simulate some changes
      const updatedResults = todaysResults.map(teamData => {
        const resultTime = new Date(teamData.results[0].timestamp);
        const isUpcoming = resultTime > today;
        const result = isUpcoming ? null : `${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10)}`;
        
        return {
          ...teamData,
          results: [{
            ...teamData.results[0],
            result,
            upcoming: isUpcoming
          }],
          upcomingCount: isUpcoming ? 1 : 0,
          completedCount: isUpcoming ? 0 : 1
        };
      });
      
      setTodaysResults(updatedResults);
      setLoading(false);
    }, 1000);
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
          <h1 className="text-2xl font-bold">Today's Matka Results</h1>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{currentDate}</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
        <div className="text-sm font-medium text-gray-500">
          {todaysResults.length > 0 ? 
            `${todaysResults.length} Matka results today` : 
            "No results scheduled"}
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
            <span className="text-gray-600 font-medium">Loading Matka results...</span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Results display */}
      {!loading && !error && (
        <div className="p-4">
          {todaysResults.length > 0 ? (
            <div className="space-y-4">
              {todaysResults.map((teamData, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Team header - clickable to expand/collapse */}
                  <div 
                    className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 flex justify-between items-center cursor-pointer hover:from-gray-700 hover:to-gray-600 transition"
                    onClick={() => toggleTeamExpansion(teamData.team)}
                  >
                    <div className="font-bold text-lg">{teamData.team}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-xs bg-opacity-20 bg-white px-2 py-1 rounded-full">
                        {teamData.results[0].time}
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
                    <div>
                      {teamData.results.map((result, idx) => (
                        <div key={idx}>
                          <div className={`p-4 flex justify-between items-center ${result.upcoming ? "bg-blue-50" : "bg-white"}`}>
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
                          
                          {/* Description */}
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <p className="text-sm text-gray-700">{result.description}</p>
                          </div>
                          
                          {/* Pro Tip */}
                          <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
                            <p className="text-sm text-yellow-800">
                              <span className="font-bold">Pro Tip:</span> {result.tip}
                            </p>
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