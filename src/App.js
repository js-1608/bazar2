import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import TeamResults from './pages/TeamResult';
import Home2 from './pages/Home2';
import GameList from './pages/GameList';
import Faq from './pages/Faq';

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// API Service
const API_URL = 'http://localhost:5500';

const apiService = {
  login: async (accessKey, password) => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessKey, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  getTeams: async (token) => {
    const response = await fetch(`${API_URL}/api/teams`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }

    return response.json();
  },

  createTeam: async (teamData, token) => {
    const response = await fetch(`${API_URL}/admin/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) {
      throw new Error('Failed to create team');
    }

    return response.json();
  },

  updateTeam: async (id, teamData, token) => {
    const response = await fetch(`${API_URL}/admin/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) {
      throw new Error('Failed to update team');
    }

    return response.json();
  },

  deleteTeam: async (id, token) => {
    const response = await fetch(`${API_URL}/admin/teams/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to delete team');
    }

    return response.json();
  },

  publishResult: async (resultData, token) => {
    console.log("Publishing result with data:", resultData);
    console.log("Using token:", token);

    const response = await fetch(`${API_URL}/admin/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resultData)
    });
    // In your publishResult function


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Server responded with error:", response.status, errorData);
      console.log("Sending exact payload:", JSON.stringify(resultData));
      throw new Error(`Failed to publish result: ${response.status}`);
    } else {
      console.log("Response is ok")
    }

    return response.json();
  },

  updateResult: async (id, resultData, token) => {
    console.log(`Updating result ${id} with data:`, resultData);

    try {
      const response = await fetch(`${API_URL}/admin/results/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultData)
      });

      if (!response.ok) {
        // Try to get error details if available
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateResult:", error);
      throw error;
    }
  },

  deleteResult: async (id, token) => {
    console.log(`Deleting result ${id}`);

    try {
      const response = await fetch(`${API_URL}/admin/results/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // Try to get error details if available
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in deleteResult:", error);
      throw error;
    }
  },

  getDailyResults: async (date, token) => {
    const response = await fetch(`${API_URL}/api/results/daily?date=${date}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to fetch daily results');
    }

    return response.json();
  },

  getMonthlyResults: async (team, month) => {
    const response = await fetch(`${API_URL}/api/results/monthly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team, month })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch monthly results');
    }

    return response.json();
  },

  getTodayResults: async () => {
    const response = await fetch(`${API_URL}/api/today`);

    if (!response.ok) {
      throw new Error('Failed to fetch today\'s results');
    }

    return response.json();
  },

  // Scheduled games API endpoints
  getScheduledGames: async (date, token) => {
    const response = await fetch(`${API_URL}/api/schedule?date=${date}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled games');
    }

    return response.json();
  },

  createScheduledGame: async (gameData, token) => {
    const response = await fetch(`${API_URL}/admin/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      throw new Error('Failed to create scheduled game');
    }

    return response.json();
  },

  updateScheduledGame: async (id, gameData, token) => {
    const response = await fetch(`${API_URL}/admin/schedule/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      throw new Error('Failed to update scheduled game');
    }

    return response.json();
  },

  deleteScheduledGame: async (id, token) => {
    const response = await fetch(`${API_URL}/admin/schedule/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to delete scheduled game');
    }

    return response.json();
  }
};

// Components
const Login = () => {
  const [accessKey, setAccessKey] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiService.login(accessKey, password);
      console.log("Login successful, token:", data.token);
      login(data.token);
      navigate('/teams');
    } catch (err) {
      console.error("Login failed:", err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Access Key</label>
          <input
            type="text"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </div>
  );
};

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await apiService.getTeams(token);
        setTeams(data);
        alert(teams)
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch teams');
        setLoading(false);
      }
    };

    fetchTeams();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await apiService.deleteTeam(id, token);
        setTeams(teams.filter(team => team.id !== id));
      } catch (err) {
        setError('Failed to delete team');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="team-list-container">
      <h2>Team Management</h2>
      <Link to="/teams/new" className="btn-primary">Add New Team</Link>
      <table className="team-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>{team.id}</td>
              <td>{team.name}</td>
              <td>
                <Link to={`/teams/edit/${team.id}`} className="btn-secondary">Edit</Link>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TeamForm = ({ isEdit = false }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit && id) {
      const fetchTeam = async () => {
        try {
          const teams = await apiService.getTeams(token);
          const team = teams.find(t => t.id === parseInt(id));
          if (team) {
            // Use the exact name as stored in the database
            setName(team.name);
          }
        } catch (err) {
          setError('Failed to fetch team details');
        }
      };

      fetchTeam();
    }
  }, [isEdit, id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Send the name exactly as entered by the user without any transformation
      if (isEdit) {
        await apiService.updateTeam(id, { name }, token);
      } else {
        await apiService.createTeam({ name }, token);
      }
      navigate('/teams');
    } catch (err) {
      setError(isEdit ? 'Failed to update team' : 'Failed to create team');
      setSubmitting(false);
    }
  };

  return (
    <div className="team-form-container">
      <h2>{isEdit ? 'Edit Team' : 'Add New Team'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter team name exactly as desired"
          />
          <small className="form-text">Name will be saved exactly as entered</small>
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Team' : 'Create Team')}
        </button>
        <Link to="/teams" className="btn-secondary">Cancel</Link>
      </form>
    </div>
  );
};

const ResultCalendar = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsData, resultsData] = await Promise.all([
        apiService.getTeams(token),
        apiService.getDailyResults(date, token)
      ]);
      setTeams(teamsData);
      setResults(resultsData);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, token]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleDeleteResult = async (id) => {
    // First, ensure the ID is valid
    if (!id) {
      console.error("Invalid result ID:", id);
      setError("Cannot delete result: Invalid ID");
      return;
    }

    console.log("Attempting to delete result with ID:", id);

    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await apiService.deleteResult(id, token);
        // Refresh the results after deletion
        fetchData();
      } catch (err) {
        console.error("Error deleting result:", err);
        setError(`Failed to delete result: ${err.message}`);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="calendar-container">
      <h2>Results Calendar</h2>
      <div className="date-picker">
        <label>Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
        />
      </div>

      <div className="results-container">
        <h3>Results for {date}</h3>
        <Link to={`/results/new?date=${date}`} className="btn-primary">Add New Result</Link>

        {error && <div className="error">{error}</div>}

        {results.length === 0 ? (
          <p>No results for this date.</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Result</th>
                <th>Result Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>{result.team}</td>
                  <td>{result.visible_result || result.result}</td>
                  <td>{new Date(result.result_time).toISOString().split('T').join(" ").replace("Z", "").slice(0, -4)}</td>
                  <td>
                    <Link to={`/admin/results/edit/${result.id}?date=${date}`} className="btn-secondary">Edit</Link>
                    <button
                      onClick={() => handleDeleteResult(`${result.id}`)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// result form to update result
const ResultForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    team: '',
    result: '',
    date: new Date().toISOString().split('T')[0],
    result_time: '12:00:00' // Default now includes seconds
  });
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsData = await apiService.getTeams(token);
        setTeams(teamsData);

        // Set date from query params if available
        const params = new URLSearchParams(location.search);
        const dateParam = params.get('date');
        if (dateParam) {
          setFormData(prev => ({ ...prev, date: dateParam }));
        }

        // If editing, fetch the result details
        if (isEdit && id) {
          const results = await apiService.getDailyResults(dateParam || formData.date, token);
          const result = results.find(r => r.id === parseInt(id));
          if (result) {
            // Extract time from result_time and ensure it has seconds
            const resultTime = result.result_time.split(' ')[1];
            const formattedTime = resultTime.includes('.')
              ? resultTime.split('.')[0]
              : resultTime.length === 5 ? `${resultTime}:00` : resultTime;

            setFormData({
              team: result.team, // Use the exact team name as stored
              result: result.visible_result,
              date: result.result_time.split(' ')[0],
              result_time: formattedTime
            });
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, [isEdit, id, token, location.search, formData.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        team: formData.team, // Use the exact team name as selected
        result: formData.result,
        result_time: `${formData.date} ${formData.result_time}`
      };

      if (isEdit) {
        await apiService.updateResult(id, payload, token);
      } else {
        await apiService.publishResult(payload, token);
      }
      navigate(`/admin/results?date=${formData.date}`);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(isEdit ? 'Failed to update result' : 'Failed to publish result');
      setSubmitting(false);
    }
  };

  return (
    <div className="result-form-container">
      <h2>{isEdit ? 'Edit Result' : 'Add New Result'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Team</label>
          <select
            name="team"
            value={formData.team}
            onChange={handleChange}
            required
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Result</label>
          <input
            type="text"
            name="result"
            value={formData.result}
            onChange={handleChange}
            placeholder="e.g., 45"
            required
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Result Time (HH:MM:SS)</label>
          <input
            type="time"
            name="result_time"
            value={formData.result_time}
            onChange={handleChange}
            step="1" // Enable seconds in the time picker
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Result' : 'Publish Result')}
        </button>
        <Link to={`/admin/results?date=${formData.date}`} className="btn-secondary">Cancel</Link>
      </form>
    </div>
  );
};
// Scheduled Games Components
const ScheduleCalendar = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledGames, setScheduledGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);

  useEffect(() => {
    const fetchScheduledGames = async () => {
      try {
        const data = await apiService.getScheduledGames(date, token);
        setScheduledGames(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch scheduled games');
        setLoading(false);
      }
    };

    fetchScheduledGames();
  }, [date, token]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleDeleteScheduledGame = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled game?')) {
      try {
        await apiService.deleteScheduledGame(id, token);
        setScheduledGames(scheduledGames.filter(game => game.id !== id));
      } catch (err) {
        setError('Failed to delete scheduled game');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="schedule-container">
      <h2>Scheduled Games</h2>
      <div className="date-picker">
        <label>Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
        />
      </div>

      <div className="scheduled-games-container">
        <h3>Games scheduled for {date}</h3>
        <Link to={`/admin/schedule/new?date=${date}`} className="btn-primary">Schedule New Game</Link>

        {scheduledGames.length === 0 ? (
          <p>No games scheduled for this date.</p>
        ) : (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduledGames.map(game => (
                <tr key={game.id}>
                  <td>{game.home_team_name}</td>
                  <td>{game.away_team_name}</td>
                  <td>{game.game_time}</td>
                  <td>{game.status}</td>
                  <td>
                    <Link to={`/admin/schedule/edit/${game.id}?date=${date}`} className="btn-secondary">Edit</Link>
                    <button
                      onClick={() => handleDeleteScheduledGame(game.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ScheduleForm component with seconds support
const ScheduleForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    home_team: '',
    away_team: '',
    game_date: new Date().toISOString().split('T')[0],
    game_time: '12:00:00', // Default now includes seconds
    status: 'SCHEDULED'
  });
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsData = await apiService.getTeams(token);
        setTeams(teamsData);

        // Set date from query params if available
        const params = new URLSearchParams(location.search);
        const dateParam = params.get('date');
        if (dateParam) {
          setFormData(prev => ({ ...prev, game_date: dateParam }));
        }

        // If editing, fetch the scheduled game details
        if (isEdit && id) {
          const games = await apiService.getScheduledGames(dateParam || formData.game_date, token);
          const game = games.find(g => g.id === parseInt(id));
          if (game) {
            // Ensure game_time includes seconds
            const gameTime = game.game_time;
            const formattedTime = gameTime.length === 5 ? `${gameTime}:00` : gameTime;

            setFormData({
              home_team: game.home_team_id.toString(),
              away_team: game.away_team_id.toString(),
              game_date: game.game_date,
              game_time: formattedTime,
              status: game.status
            });
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, [isEdit, id, token, location.search, formData.game_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        // Ensure the API receives the complete time with seconds
        game_time: formData.game_time.length === 5 ? `${formData.game_time}:00` : formData.game_time
      };

      if (isEdit) {
        await apiService.updateScheduledGame(id, payload, token);
      } else {
        await apiService.createScheduledGame(payload, token);
      }
      navigate(`/admin/schedule?date=${formData.game_date}`);
    } catch (err) {
      setError(isEdit ? 'Failed to update scheduled game' : 'Failed to create scheduled game');
      setSubmitting(false);
    }
  };

  return (
    <div className="schedule-form-container">
      <h2>{isEdit ? 'Edit Scheduled Game' : 'Schedule New Game'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Home Team</label>
          <select
            name="home_team"
            value={formData.home_team}
            onChange={handleChange}
            required
          >
            <option value="">Select home team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Away Team</label>
          <select
            name="away_team"
            value={formData.away_team}
            onChange={handleChange}
            required
          >
            <option value="">Select away team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="game_date"
            value={formData.game_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Time (HH:MM:SS)</label>
          <input
            type="time"
            name="game_time"
            value={formData.game_time}
            onChange={handleChange}
            step="1" // Enable seconds in the time picker
            required
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Game' : 'Schedule Game')}
        </button>
        <Link to={`/admin/schedule?date=${formData.game_date}`} className="btn-secondary">Cancel</Link>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const { logout } = React.useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={logout} className="btn-danger">Logout</button>
      </header>

      <nav className="dashboard-nav">
        <Link to="/teams" className="nav-link">Teams</Link>
        <Link to="/results" className="nav-link">Results</Link>
        <Link to="/schedule" className="nav-link">Schedule</Link>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route path="/teams" element={<TeamList />} />
          <Route path="/teams/new" element={<TeamForm />} />
          <Route path="/teams/edit/:id" element={<TeamForm isEdit={true} />} />
          <Route path="/results" element={<ResultCalendar />} />
          <Route path="/results/new" element={<ResultForm />} />
          <Route path="/results/edit/:id" element={<ResultForm isEdit={true} />} />
          <Route path="/schedule" element={<ScheduleCalendar />} />
          <Route path="/schedule/new" element={<ScheduleForm />} />
          <Route path="/schedule/edit/:id" element={<ScheduleForm isEdit={true} />} />
          <Route path="/" element={<Navigate to="/teams" />} />
        </Routes>
      </div>
    </div>
  );
};


// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// App
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Home2 />} />
          <Route path="/games" element={<GameList />} />
          <Route path="/res" element={<TeamResults />} />
          <Route path="/faq" element={<Faq />} />

        </Routes>
      </AuthProvider>
    </Router>

  );
};

export default App;