import React, { useState } from 'react';
import { BarChart2, Calendar } from 'lucide-react';
import { useEffect } from 'react';
const Home = () => {
  const [teams, setTeams] = useState([
    { id: 1, name: 'BIKANER SUPER', time: '02:20 AM', results: { '2025-03-11': '04', '2025-03-12': '61' } },
    { id: 2, name: 'DESAWAR', time: '05:00 AM', results: { '2025-03-11': '79', '2025-03-12': '55' } },
    { id: 3, name: 'FARIDABAD', time: '06:00 PM', results: { '2025-03-11': '78', '2025-03-12': '98' } },
    { id: 4, name: 'GHAZIABAD', time: '09:30 PM', results: { '2025-03-11': '19', '2025-03-12': '23' } },
    { id: 5, name: 'GALI', time: '11:30 PM', results: { '2025-03-11': '72', '2025-03-12': 'XX' } },
  ]);
  
  const [dates] = useState(['2025-03-11', '2025-03-12']);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showChartView, setShowChartView] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  
  
  // Show chart for selected team
  const handleViewChart = (team) => {
    setSelectedTeam(team);
    setShowChartView(true);
    setShowCalendar(false);
  };

  // Generate mock chart data for the selected team
  const generateChartData = () => {
    if (!selectedTeam) return [];
    
    // Generate some random data for demonstration
    const mockData = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      mockData.unshift({
        date: dateStr,
        result: Math.floor(Math.random() * 100).toString().padStart(2, '0')
      });
    }
    
    return mockData;
  };

  // Generate calendar view with results
  const generateCalendarData = () => {
    const calendarDays = [];
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Add empty cells for days before the first of the month
    const firstDayWeekday = firstDayOfMonth.getDay();
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate mock results for each team on this date
      const dayResults = {};
      teams.forEach(team => {
        dayResults[team.id] = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      });
      
      calendarDays.push({
        day: i,
        date: dateStr,
        results: dayResults
      });
    }
    
    return calendarDays;
  };

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    setCurrentTime(formattedTime);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4">
       <div className="w-full bg-gray-100 p-4 text-center">
      {/* Header */}
      <h1 className="text-3xl font-bold text-black uppercase">SATTA-KING-FAST.com</h1>
      
      {/* Advertisement Banner */}
      <div className="mt-4 flex justify-center items-center">
        <img 
          src="/path-to-your-advertisement-image.jpg" 
          alt="Advertisement" 
          className="w-full max-w-4xl" 
        />
      </div>
      
      {/* Informational Text */}
      <p className="mt-4 text-gray-700 text-sm  p-1 w-[100%] lg:w-3/4 m-auto">
        Delhi Diamond Satta Result And Monthly Satta Chart of March 2025 With Combined Chart of Gali, Desawar, Ghaziabad, Faridabad And Shri Ganesh from Satta King Fast, Satta King Result, Satta King Chart, Black Satta King and Satta King 786.
      </p>
      
      {/* Disclaimer */}
      <p className="mt-2 text-blue-600 text-sm font-medium bg-white p-1 w-[100%] lg:w-3/4 m-auto">
        Satta-King-Fast.com is the most popular gaming discussion forum for players to use freely and we are not in partnership with any gaming company.
      </p>
      
      {/* Warning Message */}
      <p className="mt-2 text-red-600 font-bold bg-white p-1 w-[100%] lg:w-3/4 m-auto">
        कृपया ध्यान दें, लीक गेम के नाम पर किसी को कोई पैसा न दें, ना पहले ना बाद में - धन्यवाद
      </p>
      
      {/* Contact Link */}
      <p className="mt-2 text-green-600 font-medium bg-white p-1 w-[100%] lg:w-3/4 m-auto">
        हमसे संपर्क करने के लिए ➡ <a href="#" className="underline">यहाँ क्लिक करें</a>
      </p>
      
      {/* Timestamp */}
      <p className="mt-2 text-gray-600 text-xs">
        Updated: {currentTime} IST.
      </p>
    </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-400 p-4 text-white text-center text-xl font-bold rounded-t-lg">
          Bikaner Super Satta Result of March 12, 2025 & March 11, 2025
        </div>
        
        {/* Controls */}
        <div className="bg-white p-4 mb-4 flex justify-between items-center">
          <div className="text-lg font-semibold">Latest Results</div>
          
          <div className="flex gap-2">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={() => {
                setShowCalendar(true);
                setShowChartView(false);
              }}
            >
              <Calendar size={16} />
              Calendar View
            </button>
          </div>
        </div>
        
        {/* Chart View */}
        {showChartView && selectedTeam && (
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
                  {generateChartData().map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border p-2">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="border p-2 text-right font-bold">{item.result}</td>
                    </tr>
                  ))}
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
        {showCalendar && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Calendar View: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {generateCalendarData().map((day, index) => (
                <div key={index} className={`border rounded p-2 min-h-16 ${day ? 'bg-white' : ''}`}>
                  {day && (
                    <>
                      <div className="text-right text-sm text-gray-500">{day.day}</div>
                      {teams.map(team => (
                        <div key={team.id} className="text-xs mt-1">
                          <span className="font-semibold">{team.name.split(' ')[0]}:</span> {day.results[team.id]}
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
        {!showCalendar && (
          <div className="bg-white rounded-b-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left">Games List</th>
                  <th className="p-3 text-center">
                    {new Date(dates[0]).toLocaleDateString('en-US', { weekday: 'short' })} {new Date(dates[0]).getDate()}th
                  </th>
                  <th className="p-3 text-center">
                    {new Date(dates[1]).toLocaleDateString('en-US', { weekday: 'short' })} {new Date(dates[1]).getDate()}th
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
                      <div className="text-xs text-blue-500 underline mt-1">Record Chart</div>
                    </td>
                    <td className="p-3 text-center text-2xl font-bold">{team.results[dates[0]] || 'XX'}</td>
                    <td className="p-3 text-center text-2xl font-bold">{team.results[dates[1]] || 'XX'}</td>
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
              </tbody>
            </table>
            
            <div className="bg-gray-700 text-white text-center p-3">
              <button className="hover:underline">Click here for all games results.</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;