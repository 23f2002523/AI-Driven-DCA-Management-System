import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admindashboard.css';

interface User {
  username: string;
  role?: string;
}

interface DebtCase {
  id: number;
  debtor_name: string;
  amount: number;
  status: string;
  recovery_probability?: number;
  ai_priority: 'High' | 'Medium' | 'Low';
  days_overdue: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<DebtCase[]>([]);
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

    setUser(JSON.parse(userData));
    fetchCases();
  }, [navigate]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/cases', {
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
      console.error('Error fetching cases:', error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    // Mock data for frontend testing when backend is not available
    const mockCases: DebtCase[] = [
      { id: 1, debtor_name: 'John Smith', amount: 15000, status: 'active', recovery_probability: 0.85, ai_priority: 'High', days_overdue: 120 },
      { id: 2, debtor_name: 'Sarah Johnson', amount: 8500, status: 'active', recovery_probability: 0.62, ai_priority: 'Medium', days_overdue: 45 },
      { id: 3, debtor_name: 'Michael Brown', amount: 22000, status: 'active', recovery_probability: 0.34, ai_priority: 'Low', days_overdue: 15 },
      { id: 4, debtor_name: 'Emily Davis', amount: 18500, status: 'active', recovery_probability: 0.78, ai_priority: 'High', days_overdue: 95 },
      { id: 5, debtor_name: 'David Wilson', amount: 12000, status: 'resolved', recovery_probability: 0.92, ai_priority: 'Medium', days_overdue: 30 },
      { id: 6, debtor_name: 'Lisa Martinez', amount: 9500, status: 'active', recovery_probability: 0.55, ai_priority: 'Medium', days_overdue: 60 },
      { id: 7, debtor_name: 'James Anderson', amount: 28000, status: 'active', recovery_probability: 0.28, ai_priority: 'Low', days_overdue: 10 },
      { id: 8, debtor_name: 'Jessica Taylor', amount: 16500, status: 'active', recovery_probability: 0.88, ai_priority: 'High', days_overdue: 105 },
    ];
    setCases(mockCases);
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

  // Calculate AI-driven KPIs
  const highPriorityCases = cases.filter(c => c.ai_priority === 'High').length;
  const avgRecoveryProb = cases.length > 0
    ? (cases.reduce((sum, c) => sum + (c.recovery_probability || 0), 0) / cases.length * 100).toFixed(1)
    : '0';
  const casesAtRisk = cases.filter(c => c.days_overdue > 90).length;

  // Helper function to get recovery status based on probability
  const getRecoveryStatus = (probability: number) => {
    if (probability >= 0.8) return 'Likely Recoverable';
    if (probability < 0.4) return 'High Risk';
    return 'Moderate Risk';
  };

  // Helper function to get priority label
  const getPriorityLabel = (priority: string) => {
    if (priority === 'High') return 'High Recovery Priority';
    if (priority === 'Medium') return 'Moderate Recovery Priority';
    if (priority === 'Low') return 'Low Recovery Probability';
    return priority;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AI-Driven DCA Management System</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Cases</h3>
            <p className="stat-value">{cases.length}</p>
          </div>
          <div className="stat-card">
            <h3>High Recovery Priority</h3>
            <p className="stat-value">{highPriorityCases}</p>
          </div>
          <div className="stat-card">
            <h3>Avg Recovery Probability</h3>
            <p className="stat-value">{avgRecoveryProb}%</p>
          </div>
          <div className="stat-card">
            <h3>Cases at Risk (90+ days)</h3>
            <p className="stat-value">{casesAtRisk}</p>
          </div>
        </div>

        <div className="cases-section">
          <div className="cases-header">
            <h2>Debt Collection Cases</h2>
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
            <p>Loading cases...</p>
          ) : (
            <div className="cases-table-container">
              <table className="cases-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Debtor Name</th>
                    <th>Amount</th>
                    <th>Days Overdue</th>
                    <th>Recovery Priority</th>
                    <th>Recovery Probability</th>
                    <th>Recovery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.length > 0 ? (
                    filteredCases.map(caseItem => (
                      <tr key={caseItem.id}>
                        <td>{caseItem.id}</td>
                        <td>{caseItem.debtor_name}</td>
                        <td>${caseItem.amount.toLocaleString()}</td>
                        <td>{caseItem.days_overdue} days</td>
                        <td>
                          <span className={`priority-badge priority-${caseItem.ai_priority.toLowerCase()}`}>
                            {getPriorityLabel(caseItem.ai_priority)}
                          </span>
                        </td>
                        <td>
                          {caseItem.recovery_probability 
                            ? `${(caseItem.recovery_probability * 100).toFixed(1)}%`
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={`status-badge status-recovery-${
                            caseItem.recovery_probability >= 0.8 ? 'likely' : 
                            caseItem.recovery_probability < 0.4 ? 'risk' : 'moderate'
                          }`}>
                            {getRecoveryStatus(caseItem.recovery_probability || 0)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center' }}>No cases found</td>
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

export default AdminDashboard;
