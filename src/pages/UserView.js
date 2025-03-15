import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar } from 'lucide-react';
import DataService from '../services/DataService';

export const SattaUserView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dates] = useState(['2025-03-11', '2025-03-12']);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showChartView, setShowChartView] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await DataService.getTeams();
        setTeams(data);
        setError(null);
      } catch (err) {
        setError('Failed to load teams data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    // Subscribe to real-time updates
    const unsubscribe = DataService.subscribeToUpdates((updatedTeams) => {
      setTeams(updatedTeams);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
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
  )
};
