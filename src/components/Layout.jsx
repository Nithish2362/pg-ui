import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  
  const logout = () => { 
    localStorage.removeItem('admin_token'); 
    localStorage.removeItem('admin_user'); 
    navigate('/login'); 
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">🏠 PG Admin</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span><span>Dashboard</span>
          </NavLink>
          <NavLink to="/locations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📍</span><span>Locations</span>
          </NavLink>
          <NavLink to="/buildings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏢</span><span>Buildings</span>
          </NavLink>
          <NavLink to="/floors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏗️</span><span>Floors</span>
          </NavLink>
          <NavLink to="/rooms" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🚪</span><span>Rooms</span>
          </NavLink>
          <NavLink to="/tenants" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">👥</span><span>Tenants</span>
          </NavLink>
          <NavLink to="/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="icon">💰</span><span>Payments</span>
          </NavLink>
        </nav>
        <button className="sidebar-logout" onClick={logout}>🚪 Logout</button>
      </aside>
      <main className="main-content">{children}</main>
    </>
  );
};

export default Layout;
