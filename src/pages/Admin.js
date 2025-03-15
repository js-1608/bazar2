import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, BarChart2, LogIn, Calendar as CalendarIcon } from 'lucide-react';

const Admin = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Static credentials - in a real app, these would be stored securely
  const validCredentials = {
    username: 'admin',
    password: 'satta123'
  };

  const [teams, setTeams] = useState([
    { id: 1, name: 'BIKANER SUPER', time: '02:20 AM', results: { '2025-03-11': '04', '2025-03-12': '61' } },
    { id: 2, name: 'DESAWAR', time: '05:00 AM', results: { '2025-03-11': '79', '2025-03-12': '55' } },
    { id: 3, name: 'FARIDABAD', time: '06:00 PM', results: { '2025-03-11': '78', '2025-03-12': '98' } },
    { id: 4, name: 'GHAZIABAD', time: '09:30 PM', results: { '2025-03-11': '19', '2025-03-12': '23' } },
    { id: 5, name: 'GALI', time: '11:30 PM', results: { '2025-03-11': '72', '2025-03-12': 'XX' } },
  ]);
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showChartView, setShowChartView] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formData, setFormData] = useState({ name: '', time: '', result: '' });
  const [dates, setDates] = useState(['2025-03-11', '2025-03-12']);
  const [currentDate, setCurrentDate] = useState('2025-03-12');

  // Calendar state
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // Handle login input changes
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setAuthError('');
  };

  // Handle login submission
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === validCredentials.username && 
        loginData.password === validCredentials.password) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid username or password');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  // Handle input changes for team forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add new team
  const handleAddTeam = () => {
    const newTeam = {
      id: teams.length + 1,
      name: formData.name,
      time: formData.time,
      results: { 
        [dates[0]]: '', 
        [dates[1]]: '' 
      }
    };
    setTeams([...teams, newTeam]);
    setFormData({ name: '', time: '', result: '' });
    setShowAddForm(false);
  };

  // Delete team
  const handleDeleteTeam = (id) => {
    setTeams(teams.filter(team => team.id !== id));
  };

  // Select team for editing
  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      time: team.time,
      result: team.results[currentDate] || ''
    });
    setShowEditForm(true);
    setShowChartView(false);
  };

  // Update team
  const handleUpdateTeam = () => {
    const updatedTeams = teams.map(team => {
      if (team.id === selectedTeam.id) {
        const updatedResults = { ...team.results };
        updatedResults[currentDate] = formData.result;
        
        return {
          ...team,
          name: formData.name,
          time: formData.time,
          results: updatedResults
        };
      }
      return team;
    });
    
    setTeams(updatedTeams);
    setShowEditForm(false);
    setSelectedTeam(null);
    setFormData({ name: '', time: '', result: '' });
  };

  // Show chart for selected team
  const handleViewChart = (team) => {
    setSelectedTeam(team);
    setShowChartView(true);
    setShowEditForm(false);
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

  // Calendar helpers
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(calendarYear, calendarMonth, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    // Check if the date is in the dates array
    if (!dates.includes(formattedDate)) {
      // Add the date to the dates array
      const newDates = [...dates, formattedDate].sort();
      setDates(newDates);
      
      // Update teams with the new date
      const updatedTeams = teams.map(team => {
        const updatedResults = { ...team.results };
        if (!updatedResults[formattedDate]) {
          updatedResults[formattedDate] = '';
        }
        return { ...team, results: updatedResults };
      });
      
      setTeams(updatedTeams);
    }
    
    setCurrentDate(formattedDate);
    setShowCalendar(false);
  };

  // Calendar component
  const CalendarComponent = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    
    const renderCalendarDays = () => {
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
      }
      
      // Add cells for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(calendarYear, calendarMonth, day).toISOString().split('T')[0];
        const isSelected = dates.includes(date);
        const isCurrentDate = date === currentDate;
        
        days.push(
          <div 
            key={day} 
            className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer ${
              isSelected ? 'bg-blue-100' : ''
            } ${
              isCurrentDate ? 'bg-blue-500 text-white' : ''
            } hover:bg-blue-200`}
            onClick={() => handleDateSelect(day)}
          >
            {day}
          </div>
        );
      }
      
      return days;
    };
    
    return (
      <div className="bg-white rounded shadow p-4 absolute top-full mt-1 right-0 z-10 w-[230px]">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-100">
            &lt;
          </button>
          <div className="font-semibold">
            {monthNames[calendarMonth]} {calendarYear}
          </div>
          <button onClick={handleNextMonth} className="p-1 rounded hover:bg-gray-100">
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
    );
  };

  // Login Screen Component
  const LoginScreen = () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">
          <div className="bg-emerald-400 p-4 text-white text-center text-xl font-bold rounded-t-lg">
            Bikaner Super Satta Admin Login
          </div>
          <form 
            className="bg-white shadow-md rounded-b-lg px-8 pt-6 pb-8 mb-4" 
            onSubmit={handleLogin}
          >
            {authError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {authError}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                id="username" 
                type="text" 
                name="username"
                placeholder="Username" 
                value={loginData.username}
                onChange={handleLoginInputChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                id="password" 
                type="password" 
                name="password"
                placeholder="******************" 
                value={loginData.password}
                onChange={handleLoginInputChange}
                required
              />
            </div>
            <div className="flex items-center justify-center">
              <button 
                className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2" 
                type="submit"
              >
                <LogIn size={16} />
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Render admin panel if authenticated
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-emerald-400 p-4 text-white flex justify-between items-center rounded-t-lg">
          <span className="text-xl font-bold">Bikaner Super Satta Result Admin Panel</span>
          <button 
            className="bg-white text-emerald-700 px-3 py-1 rounded text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        
        {/* Controls */}
        <div className="bg-white p-4 mb-4 flex justify-between items-center">
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={() => {
              setShowAddForm(true);
              setShowEditForm(false);
              setShowChartView(false);
              setFormData({ name: '', time: '', result: '' });
            }}
          >
            <PlusCircle size={16} />
            Add Team
          </button>
          
          <div className="relative">
            <div className="flex items-center gap-2">
              <select 
                className="border p-2 rounded"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
              >
                {dates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <button 
                className="bg-blue-500 text-white p-2 rounded flex items-center"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon size={16} />
              </button>
            </div>
            {showCalendar && <CalendarComponent />}
          </div>
        </div>
                
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Add New Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 02:20 AM"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleAddTeam}
              >
                Add Team
              </button>
            </div>
          </div>
        )}
        
        {/* Edit Form */}
        {showEditForm && selectedTeam && (
          <div className="bg-white p-4 mb-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Edit Team: {selectedTeam.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Result for {new Date(currentDate).toLocaleDateString()}</label>
                <input
                  type="text"
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 61"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleUpdateTeam}
              >
                Update Team
              </button>
            </div>
          </div>
        )}
        
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
                Back to List
              </button>
            </div>
          </div>
        )}

        {/* Teams Table */}
        <div className="bg-white rounded-b-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 text-left">Games List</th>
                <th className="p-3 text-center">
                  {new Date(dates[0]).toLocaleDateString()} <br/>
                  {new Date(dates[0]).toLocaleDateString("en-US", {weekday: 'short'})}
                </th>
                <th className="p-3 text-center">
                  {new Date(dates[1]).toLocaleDateString()} <br/>
                  {new Date(dates[1]).toLocaleDateString("en-US", {weekday: 'short'})}
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-sm text-gray-500">at {team.time}</div>
                  </td>
                  <td className="p-3 text-center text-2xl font-bold">{team.results[dates[0]] || 'XX'}</td>
                  <td className="p-3 text-center text-2xl font-bold">{team.results[dates[1]] || 'XX'}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button 
                        className="p-2 bg-blue-100 text-blue-600 rounded"
                        onClick={() => handleSelectTeam(team)}
                        title="Edit Team"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-2 bg-red-100 text-red-600 rounded"
                        onClick={() => handleDeleteTeam(team.id)}
                        title="Delete Team"
                      >
                        <Trash2 size={16} />
                      </button>
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
        </div>
      </div>
    </div>
  );
};

export default Admin;