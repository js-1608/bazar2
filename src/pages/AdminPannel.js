import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import { useParams,useNavigate,useLocation } from 'react-router-dom';
import Home from './pages/Home';
import TeamResults from './pages/TeamResult';
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
    console.log(accessKey);

    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },
  
  getTeams: async (token) => {
    const response = await fetch(`${API_URL}/api/teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    
    return response.json();
  },
  
  createTeam: async (teamData, token) => {
    const response = await fetch(`${API_URL}/api/teams`, {
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
    const response = await fetch(`${API_URL}/api/teams/${id}`, {
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
    const response = await fetch(`${API_URL}/api/teams/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete team');
    }
    
    return response.json();
  },
  
  publishResult: async (resultData, token) => {
    const response = await fetch(`${API_URL}/admin/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resultData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to publish result');
    }
    
    return response.json();
  },
  
  getDailyResults: async (date, token) => {
    const response = await fetch(`${API_URL}/api/results/daily?date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch daily results');
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiService.login(accessKey, password);
      login(data.token);
      // redirection

    } catch (err) {
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
          />
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, resultsData] = await Promise.all([
          apiService.getTeams(token),
          apiService.getDailyResults(date, token)
        ]);
        setTeams(teamsData);
        setResults(resultsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [date, token]);
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  
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
        
        {results.length === 0 ? (
          <p>No results for this date.</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>{result.team}</td>
                  <td>{result.visible_result}</td>
                  <td>
                    <Link to={`/results/edit/${result.id}?date=${date}`} className="btn-secondary">Edit</Link>
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

const ResultForm = ({ isEdit = false }) => {
  const [formData, setFormData] = useState({
    team: '',
    result: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token } = React.useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const fetchTeams = async () => {
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
          // This is a simplified approach. In a real app, you'd have an API endpoint to fetch a specific result
          const results = await apiService.getDailyResults(dateParam, token);
          const result = results.find(r => r.id === parseInt(id));
          console.log(result.team);
          if (result) {
            console.log(result)
            setFormData({
              team: result.team,
              result: result.visible_result,
              date: result.date
            });
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    
    fetchTeams();
  }, [isEdit, id, token, location.search]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await apiService.publishResult(formData, token);
      navigate(`/results?date=${formData.date}`);
    } catch (err) {
      setError('Failed to publish result');
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
              <option key={team.id} value={team.id}>{team.name}</option>
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
            placeholder="e.g., Win 3-2"
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
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={submitting}
        >
          {submitting ? 'Saving...' : (isEdit ? 'Update Result' : 'Publish Result')}
        </button>
        <Link to={`/results?date=${formData.date}`} className="btn-secondary">Cancel</Link>
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
      </nav>
      
      <div className="dashboard-content">
        <Routes>
          <Route path="/teams" element={<TeamList />} />
          <Route path="/teams/new" element={<TeamForm />} />
          <Route path="/teams/edit/:id" element={<TeamForm isEdit={true} />} />
          <Route path="/results" element={<ResultCalendar />} />
          <Route path="/results/new" element={<ResultForm />} />
          <Route path="/results/edit/:id" element={<ResultForm isEdit={true} />} />
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
      <Route path="/" element={<Home />} />
      <Route path="/res" element={<TeamResults />} />
    </Routes>
  </AuthProvider>
</Router>

    );
};

export default App;