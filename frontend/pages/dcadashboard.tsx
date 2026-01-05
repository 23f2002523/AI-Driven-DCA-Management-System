import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dcadashboard.css';

interface User {
  username: string;
  role?: string;
}

interface AssignedCase {
  id: number;
  amount: number;
  days_overdue: number;
  ai_priority: 'High' | 'Medium' | 'Low';
  recovery_probability: number;
}

const DCADashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<AssignedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Redirect if not DCA role
    if (parsedUser.role !== 'dca') {
      navigate('/admin-dashboard');
      return;
    }

    fetchAssignedCases();
  }, [navigate]);

  const fetchAssignedCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dca/cases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cases) {
          setCases(data.cases);
        } else {
          // Fallback to mock data if API returns empty
          useMockData();
        }
      } else {
        useMockData();
      }
    } catch (error) {
      console.error('Error fetching assigned cases:', error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    // Mock data for DCA assigned cases when backend is not available
    const mockAssignedCases: AssignedCase[] = [
      { id: 101, amount: 15000, days_overdue: 120, ai_priority: 'High', recovery_probability: 0.85 },
      { id: 104, amount: 18500, days_overdue: 95, ai_priority: 'High', recovery_probability: 0.78 },
      { id: 108, amount: 16500, days_overdue: 105, ai_priority: 'High', recovery_probability: 0.88 },
      { id: 102, amount: 8500, days_overdue: 45, ai_priority: 'Medium', recovery_probability: 0.62 },
      { id: 106, amount: 9500, days_overdue: 60, ai_priority: 'Medium', recovery_probability: 0.55 },
      { id: 103, amount: 22000, days_overdue: 15, ai_priority: 'Low', recovery_probability: 0.34 },
      { id: 107, amount: 28000, days_overdue: 10, ai_priority: 'Low', recovery_probability: 0.28 },
    ];
    setCases(mockAssignedCases);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Filter cases based on priority
  const filteredCases = priorityFilter === 'All' 
    ? cases 
    : cases.filter(c => c.ai_priority === priorityFilter);

  // Helper function to get priority label
  const getPriorityLabel = (priority: string) => {
    if (priority === 'High') return 'High Recovery Priority';
    if (priority === 'Medium') return 'Moderate Recovery Priority';
    if (priority === 'Low') return 'Low Recovery Probability';
    return priority;
  };

  return (
    <div className="dca-dashboard-container">
      <header className="dca-dashboard-header">
        <div className="header-content">
          <h1>DCA Dashboard – Assigned Cases</h1>
          <p className="header-subtitle">
            View and act on cases assigned to your agency based on AI recovery priority.
          </p>
        </div>
        <div className="user-info">
          <span>Agent: {user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dca-dashboard-main">
        <div className="cases-section">
          <div className="cases-header">
            <h2>Your Assigned Cases ({filteredCases.length})</h2>
            <div className="filter-controls">
              <label htmlFor="priority-filter">Filter by Recovery Priority:</label>
              <select 
                id="priority-filter"
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="priority-filter"
              >
                <option value="All">All</option>
                <option value="High">High Recovery Priority</option>
                <option value="Medium">Moderate Recovery Priority</option>
                <option value="Low">Low Recovery Probability</option>
              </select>
            </div>
          </div>
          <p className="ai-priority-note">
            <strong>Note:</strong> AI priority reflects recovery likelihood, not risk severity.
          </p>

          {loading ? (
            <p>Loading assigned cases...</p>
          ) : (
            <div className="cases-table-container">
              <table className="cases-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Amount Due</th>
                    <th>Days Overdue</th>
                    <th>Recovery Priority</th>
                    <th>Recovery Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.length > 0 ? (
                    filteredCases.map(caseItem => (
                      <tr key={caseItem.id}>
                        <td>#{caseItem.id}</td>
                        <td>${caseItem.amount.toLocaleString()}</td>
                        <td>{caseItem.days_overdue} days</td>
                        <td>
                          <span className={`priority-badge priority-${caseItem.ai_priority.toLowerCase()}`}>
                            {getPriorityLabel(caseItem.ai_priority)}
                          </span>
                        </td>
                        <td>{(caseItem.recovery_probability * 100).toFixed(1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center' }}>No cases match the selected filter</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DCADashboard;
