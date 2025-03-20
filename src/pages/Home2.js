import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, RefreshCw, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import TodaysMatch from './TodaysMatch';
import Footer from './Footer';
import Header from './Header';

const Home2 = () => {
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


  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    { question: "HOW TO PLAY", answer: "Details about how to play." },
    { question: "WHERE TO PLAY", answer: "Information on where to play." },
    { question: "WINNING NUMBERS EMAIL", answer: "Sign up for emails." },
  ];

  return (
    <div className="bg-gray-200 min-h-screen">
      <Header/>
      <div className="w-full bg-white p-4 text-center text-white">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold uppercase text-red-600">
          <img
            src="./logo.PNG"
            alt="Advertisement"
            className="w-28 h-30 m-auto"
          />
        </h1>

        {/* Advertisement Banner */}
        <div className="mt-4 flex justify-center items- border w-full lg:w-3/4 m-auto">
          <img
            src="./add.png"
            alt="Advertisement"
            className="w-auto max-w-4xl h-14"
          />
        </div>

        {/* Informational Text */}
        <p className="mt-4 text-black text-sm p-1 w-full lg:w-3/4 m-auto">
          Delhi Diamond Satta Result And Monthly Satta Chart of March 2025 With Combined Chart of Gali, Desawar, Ghaziabad, Faridabad And Shri Ganesh from Matka Satta Fast, Matka Satta Result, Matka Satta Chart, Black Matka Satta and Matka Satta 786.
        </p>

        {/* Disclaimer */}
        <p className="mt-2 text-red-400 text-sm font-medium bg-gray-900 p-2 rounded w-full lg:w-3/4 m-auto">
          Matka-Satta .com is the most popular gaming discussion forum for players to use freely and we are not in partnership with any gaming company.
        </p>

        {/* Warning Message */}
        <p className="mt-2 text-white font-bold bg-red-700 p-2 rounded w-full lg:w-3/4 m-auto">
          कृपया ध्यान दें, लीक गेम के नाम पर किसी को कोई पैसा न दें, ना पहले ना बाद में - धन्यवाद
        </p>

        {/* Contact Link */}
        <p className="mt-2 text-white font-medium bg-gray-800 p-2 rounded w-full lg:w-3/4 m-auto">
          हमसे संपर्क करने के लिए ➡ <a href="#" className="underline text-red-400 hover:text-red-300">यहाँ क्लिक करें</a>
        </p>

        {/* Timestamp */}
        <p className="mt-2 text-red-400 text-lg text-bold">
          Updated: {currentTime} IST.
        </p>
      </div>
      <div className="max-w-6xl mx-auto p-4">

        <TodaysMatch />
      </div>

<Footer/>
    </div>
  );
};

export default Home2;