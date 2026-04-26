import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      const loginData = res.data.response;
      if (loginData.role !== 'ROLE_ADMIN' && loginData.role !== 'ADMIN') { 
        setError('Access denied. Admin only.'); 
        return; 
      }
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData));
      navigate('/dashboard');
    } catch (err) { 
      setError(err.response?.data?.message || 'Invalid credentials'); 
    }
  };

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { 
        username, 
        password, 
        role: 'ADMIN',
        email: `${username}@example.com` 
      });
      setError(''); 
      alert('Admin registered! You can now login.');
    } catch (err) { 
      setError(err.response?.data?.message || 'Registration failed'); 
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🏠 PG Admin</h1>
        <p className="subtitle">Hostel Management System</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="btn-group" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Login</button>
            <button type="button" className="btn btn-success" onClick={handleRegister}>Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
