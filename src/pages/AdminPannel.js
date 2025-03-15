import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, BarChart2 } from 'lucide-react';
// import dataService from '../services/dataService';
import dataService from '../services/DataService';

const AdminPanel = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showChartView, setShowChartView] = useState(false);
  const [formData, setFormData] = useState({ name: '', time: '', result: '' });
  const [dates] = useState(['2025-03-11', '2025-03-12']);
  const [currentDate, setCurrentDate] = useState('2025-03-12');

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await dataService.getTeams();
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
    const unsubscribe = dataService.subscribeToUpdates((updatedTeams) => {
      setTeams(updatedTeams);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add new team
  const handleAddTeam = async () => {
    try {
      const newTeamData = {
        name: formData.name,
        time: formData.time,
        results: { 
          [dates[0]]: '', 
          [dates[1]]: '' 
        }
      };
      
      await dataService.addTeam(newTeamData);
      setFormData({ name: '', time: '', result: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add team');
      console.error(err);
    }
  };

  // Delete team
  const handleDeleteTeam = async (id) => {
    try {
      await dataService.deleteTeam(id);
    } catch (err) {
      setError('Failed to delete team');
      console.error(err);
    }
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
  const handleUpdateTeam = async () => {
    try {
      if (!selectedTeam) return;
      
      const updatedResults = { ...selectedTeam.results };
      updatedResults[currentDate] = formData.result;
      
      const updatedTeamData = {
        name: formData.name,
        time: formData.time,
        results: updatedResults
      };
      
      await dataService.updateTeam(selectedTeam.id, updatedTeamData);
      setShowEditForm(false);
      setSelectedTeam(null);
      setFormData({ name: '', time: '', result: '' });
    } catch (err) {
      setError('Failed to update team');
      console.error(err);
    }
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
          Bikaner Super Satta Result Admin Panel
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
          
          <div>
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

export default AdminPanel;