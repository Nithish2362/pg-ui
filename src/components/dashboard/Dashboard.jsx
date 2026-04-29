import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Interceptor';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => { 
    api.get('/dashboard')
       .then(r => setStats(r.data.response || r.data.data || r.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header"><h2>📊 DASHBOARD</h2></div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>Loading stats...</div>
      ) : (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="stat-card" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/tenants')}>
            <div className="stat-label">Total / Active Tenants</div>
            <div className="stat-value">{stats.totalTenants || 0} / {stats.activeTenants || 0}</div>
          </div>
          <div className="stat-card success" style={{ background: '#e6fcf5', padding: '20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/payments')}>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{stats.totalRevenue || 0}</div>
          </div>
          <div className="stat-card info" style={{ background: '#e7f5ff', padding: '20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/beds')}>
            <div className="stat-label">Available Beds</div>
            <div className="stat-value">{stats.availableBeds || 0}</div>
          </div>
          <div className="stat-card warning" style={{ background: '#fff9db', padding: '20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/complaints')}>
            <div className="stat-label">Open Complaints</div>
            <div className="stat-value">{stats.openComplaints || 0}</div>
          </div>
          <div className="stat-card" style={{ background: '#f3f0ff', padding: '20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/logs')}>
            <div className="stat-label">Total Log Activity</div>
            <div className="stat-value">{stats.todayCheckIns || 0} In/Outs</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
