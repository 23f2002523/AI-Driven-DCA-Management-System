import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import AdminDashboard from './pages/admindashboard';
import DCADashboard from './pages/dcadashboard';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dca-dashboard" element={<DCADashboard />} />
      </Routes>
    </Router>
  );
};

export default App;