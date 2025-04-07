import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, RefreshCw, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Footer from './Footer';
import Header from './Header';
import Translate from './Translate';
import HeroSection from './Herosection';

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
  const [upcomingMatches, setUpcomingMatches] = useState([]);


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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load team data. Please try again later.");
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


  return (
    <div className="bg-gray-200 min-h-screen">
      <Translate/>
      <Header />
      <div className="w-full bg-white p-4 text-center text-white">
        {/* Header */}
        {/* <h1 className="text-3xl md:text-4xl font-bold uppercase text-red-600">
          <img
            src="./logo.PNG"
            alt="Advertisement"
            className="w-28 h-30 m-auto"
          />
        </h1> */}

        {/* Advertisement Banner */}
        {/* <div className="mt-4 flex justify-center items- border w-full lg:w-3/4 m-auto">
          <img
            src="./add.png"
            alt="Advertisement"
            className="w-auto max-w-4xl h-14"
          />
        </div> */}
        {/* Disclaimer */}
        <p className="mt-4 text-black text-sm p-1 w-full lg:w-3/4 m-auto">
          Welcome to *Matka Satta Daily.com, your ultimate destination for accurate and timely Matka Satta results. We provide live updates, expert tips, and daily charts for all major Matka games, including **Desawar, **Delhi Bazar, **Shri Ganesh, **Faridabad, **Ghaziabad, and **Gali Matka*. Whether you're looking for results, guessing strategies, or historical data, we’ve got you covered.
        </p>

        {/* Informational Text */}
        <p className="mt-2 text-red-400 text-sm font-medium bg-gray-900 p-2 rounded w-full lg:w-3/4 m-auto">
          Matka Satta Daily Results 2025: Desawar, Delhi Bazar, Shri Ganesh, Faridabad, Ghaziabad, and Gali Matka Live Updates
        </p>



        {/* Warning Message */}
        <p className="mt-2 text-white font-bold bg-red-700 p-2 rounded w-full lg:w-3/4 m-auto">
           Please note, do not give any money to anyone in the name of leaked game, neither before nor after - Thank you
        </p>

        {/* Contact Link */}
        <p className="mt-2 text-white font-medium bg-gray-800 p-2 rounded w-full lg:w-3/4 m-auto">
          Click to contact us ➡ <a href="#" className="underline text-red-400 hover:text-red-300">Click Here</a>
        </p>

        {/* Timestamp */}
        <p className="mt-2 text-red-400 text-lg text-bold">
          Updated: {currentTime} IST.
        </p>
      </div>
      <div className="max-w-6xl mx-auto p-4">

        <HeroSection />
      </div>

      <Footer />
    </div>
  );
};

export default Home;