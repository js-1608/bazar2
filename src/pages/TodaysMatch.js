import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import axios from 'axios';
import TeamMatchTable from './Teams';

const TodaysMatch = () => {
  const [completedMatches, setCompletedMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState('');

  // API URL (from environment variable)
  const API_URL = "https://backend.matkasattadaily.com/api";

  // Format time function
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'XX:XX';
    }
  };

  // Fetch matches
  const fetchMatches = async () => {
    try {
      setLoading(true);

      // Set today's date
      const today = new Date();
      setCurrentDate(today.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }));

      const response = await axios.get(`${API_URL}/today`);
      const results = response.data;

      const completed = [];
      const upcoming = [];

      results.forEach(result => {
        const isUpcoming = new Date(result.result_time) > new Date();

        const matchInfo = {
          team: result.team,
          result: result.visible_result,
          time: formatTime(result.result_time),
        };

        if (isUpcoming) {
          upcoming.push(matchInfo);
        } else {
          completed.push(matchInfo);
        }
      });

      setCompletedMatches(completed);
      setUpcomingMatches(upcoming);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load match data. Please try again later.");
      setLoading(false);
    }
  };

  // On component mount
  useEffect(() => {
    fetchMatches();
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    fetchMatches();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* Matches Box */}
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
              {error}
            </div>
          ) : (
            <div className="text-left">
              
              {/* Completed Matches */}
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-2 text-gray-700">Completed Matches</h4>
                {completedMatches.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {completedMatches.map((match, idx) => (
                      <div key={idx} className="flex justify-between bg-white p-3 rounded shadow">
                        <span className="font-medium">{match.team}</span>
                        <span className="text-red-600 font-bold">{match.result}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No completed matches yet.</div>
                )}
              </div>

              {/* Upcoming Matches */}
              <div>
                <h4 className="font-bold text-lg mb-2 text-gray-700">Upcoming Matches</h4>
                {upcomingMatches.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {upcomingMatches.map((match, idx) => (
                      <div key={idx} className="flex justify-between bg-white p-3 rounded shadow">
                        <span className="font-medium">{match.team}</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={16} /> {match.time}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No upcoming matches scheduled.</div>
                )}
              </div>

            </div>
          )}

          {/* Refresh Button */}
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold mt-4 hover:bg-red-700 transition"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Other Boxes */}
      <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden w-full md:w-1/3">
        <div className="bg-white p-4 rounded-t-lg">
          <h2 className="text-center font-bold text-xl text-gray-800">Register To Play</h2>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-medium text-lg mb-4">
            Delhi Bazaar, Shri Ganesh, De Delhi, Faridabad, Ghaziabad, Gali and Disawar Satta, now play from anywhere.
          </h3>
          <div className="bg-gray-800 text-yellow-400 p-2 font-bold mb-2">
            No tension of payment, work of trust done with trust.
          </div>
          <div className="text-gray-800 text-sm mb-4 leading-relaxed">
            Play the game without any worry.
            <br />
            <span className="font-bold text-gray-900">((( HARRY )))</span><br />
            <span className="text-red-600 font-bold text-lg">📞 7830467644</span>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#" className="bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition">CALL NOW</a>
            <a href="#" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">WHATSAPP NOW</a>
          </div>
        </div>
      </div>

      {/* Today's Timing Box */}
      <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden w-full md:w-1/3">
        <div className="bg-white p-4 rounded-t-lg">
          <h2 className="text-center font-bold text-xl text-gray-800">Today's Timing</h2>
        </div>
        <div className="p-4">
          <TeamMatchTable />
        </div>
      </div>

    </div>
  );
};

export default TodaysMatch;
