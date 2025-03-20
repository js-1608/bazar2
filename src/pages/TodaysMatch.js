import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';

const TodaysMatch = () => {
  const [todaysMatches, setTodaysMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

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
            upcoming: new Date(result.result_time) > new Date()
          });
        });
        
        // Convert to array for display
        const groupedResults = Object.entries(teamResults).map(([team, results]) => ({
          team,
          results: results.sort((a, b) => a.upcoming - b.upcoming)
        }));
        
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

  // Navigation handlers
  const handleNext = () => {
    if (todaysMatches.length > 0) {
      setActiveTeamIndex((prevIndex) => 
        prevIndex === todaysMatches.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrev = () => {
    if (todaysMatches.length > 0) {
      setActiveTeamIndex((prevIndex) => 
        prevIndex === 0 ? todaysMatches.length - 1 : prevIndex - 1
      );
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        const todayResultsResponse = await axios.get(`${API_URL}/today`);
        const todayResults = todayResultsResponse.data;
        
        const teamResults = {};
        
        todayResults.forEach(result => {
          if (!teamResults[result.team]) {
            teamResults[result.team] = [];
          }
          teamResults[result.team].push({
            result: result.visible_result,
            time: formatTime(result.result_time),
            upcoming: new Date(result.result_time) > new Date()
          });
        });
        
        const groupedResults = Object.entries(teamResults).map(([team, results]) => ({
          team,
          results: results.sort((a, b) => a.upcoming - b.upcoming)
        }));
        
        setTodaysMatches(groupedResults);
        setLoading(false);
      } catch (err) {
        setError("Failed to refresh match data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  };

  // Render boxes similar to lottery design
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Today's Matches Box */}
      <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden w-full md:w-1/3">
        <div className="bg-white p-4 rounded-t-lg">
          <h2 className="text-center font-bold text-xl text-gray-800">Winning Numbers</h2>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-medium text-lg mb-4">{currentDate}</h3>
          
          {loading ? (
            <div className="flex justify-center p-6">
              <RefreshCw size={24} className="animate-spin text-red-600" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
              <p>{error}</p>
            </div>
          ) : todaysMatches.length > 0 ? (
            <div className="relative">
              {/* Navigation buttons */}
              <button 
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-1 z-10"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button 
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-1 z-10"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Current team results */}
              <div className="py-2">
                <div className="bg-gray-800 text-white p-2 font-semibold rounded-t mb-2">
                  {todaysMatches[activeTeamIndex]?.team || "No Team"}
                </div>
                
                <div className="overflow-y-auto max-h-48">
                  {todaysMatches[activeTeamIndex]?.results.map((result, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 mb-2 rounded shadow">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span>{result.time}</span>
                      </div>
                      <div className={`text-xl font-bold ${result.upcoming ? 'text-gray-400' : 'text-red-600'}`}>
                        {result.upcoming ? "Upcoming" : result.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Team indicators */}
              <div className="flex justify-center gap-1 mt-2">
                {todaysMatches.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-2 w-2 rounded-full ${idx === activeTeamIndex ? 'bg-red-600' : 'bg-gray-400'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 text-gray-500">
              No match results available for today.
            </div>
          )}
          
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold mt-4 hover:bg-red-700 transition"
            onClick={handleRefresh}
          >
            PLay Now
          </button>
          
          {/* <div className="mt-4 grid gap-2">
            <button className="bg-gray-800 text-white p-3 rounded font-medium">
              VIEW RESULTS
            </button>
            <button className="bg-gray-800 text-white p-3 rounded font-medium">
              CHECK YOUR NUMBERS
            </button>
          </div> */}
        </div>
      </div>
      
      {/* Next Drawing Box */}
      <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden w-full md:w-1/3">
        <div className="bg-white p-4 rounded-t-lg">
          <h2 className="text-center font-bold text-xl text-gray-800">Next Drawing</h2>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-medium text-lg mb-4">Sat, Mar 22, 2025</h3>
          
          <div className="flex justify-center gap-2 my-4">
            <div className="bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded">
              <div className="text-xl font-bold">67</div>
            </div>
            <div className="bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded">
              <div className="text-xl font-bold">58</div>
            </div>
            <div className="bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded">
              <div className="text-xl font-bold">11</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 text-xs text-gray-600 mb-4">
            <div className="text-center w-12">HOURS</div>
            <div className="text-center w-12">MINUTES</div>
            <div className="text-center w-12">SECONDS</div>
          </div>
          
          <div className="bg-gray-800 text-yellow-400 p-2 font-bold mb-2">
            ESTIMATED JACKPOT
          </div>
          
          <div className="text-red-600 text-4xl font-bold mb-4">
            $444 Million
          </div>
          
          <div className="bg-gray-800 text-yellow-400 p-2 font-bold mb-2">
            CASH VALUE
          </div>
          
          <div className="text-red-600 text-4xl font-bold">
            $207.2 Million
          </div>
        </div>
      </div>
      
      {/* Winners Box */}
      <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden w-full md:w-1/3">
        <div className="bg-white p-4 rounded-t-lg">
          <h2 className="text-center font-bold text-xl text-gray-800">Winners</h2>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-medium text-lg mb-4">Wed, Mar 19, 2025</h3>
          
          <div className="text-center mb-4">
            <div className="font-bold">POWERBALL</div>
            <div className="text-2xl font-bold">JACKPOT WINNERS</div>
            <div className="text-red-600 text-xl">None</div>
          </div>
          
          <div className="text-center mb-4">
            <div className="font-bold">MATCH 5 + POWER PLAY</div>
            <div className="text-2xl font-bold">$2 MILLION WINNERS</div>
            <div className="text-red-600 text-xl">CO, TX</div>
          </div>
          
          <div className="text-center">
            <div className="font-bold">MATCH 5</div>
            <div className="text-2xl font-bold">$1 MILLION WINNERS</div>
            <div className="text-red-600 text-xl">None</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysMatch;