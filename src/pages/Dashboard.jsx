import React, { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  
  useEffect(() => { 
    api.get('/admin/tenants/dashboard-stats')
       .then(r => setStats(r.data.response || r.data.data || r.data))
       .catch(() => {}); 
  }, []);

  return (
    <div>
      <div className="page-header"><h2>Dashboard</h2></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Rooms</div><div className="stat-value">{stats.totalRooms || 0}</div></div>
        <div className="stat-card success"><div className="stat-label">Active Tenants</div><div className="stat-value">{stats.activeTenants || 0}</div></div>
        <div className="stat-card info"><div className="stat-label">Total Beds</div><div className="stat-value">{stats.totalBeds || 0}</div></div>
        <div className="stat-card warning"><div className="stat-label">Occupied Beds</div><div className="stat-value">{stats.occupiedBeds || 0}</div></div>
      </div>
    </div>
  );
};

export default Dashboard;
