import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Lazy loading components
const Login = lazy(() => import('./components/Login'));
const Layout = lazy(() => import('./layout/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Floors = lazy(() => import('./pages/Floors'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Tenants = lazy(() => import('./pages/Tenants'));
const Payments = lazy(() => import('./pages/Payments'));
const Locations = lazy(() => import('./pages/Locations'));
const Buildings = lazy(() => import('./pages/Buildings'));

const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Basic check: if views exist, check if current path is allowed
  // For now, if no views are populated, we'll allow access to everything if logged in
  if (user?.views?.length > 0) {
      const isAllowed = user.views.some(view => location.pathname.includes(view.path));
      // if (!isAllowed && location.pathname !== '/dashboard') {
      //     return <Navigate to="/dashboard" />;
      // }
  }

  return <Component />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/locations" element={<ProtectedRoute element={Locations} />} />
            <Route path="/buildings" element={<ProtectedRoute element={Buildings} />} />
            <Route path="/floors" element={<ProtectedRoute element={Floors} />} />
            <Route path="/rooms" element={<ProtectedRoute element={Rooms} />} />
            <Route path="/tenants" element={<ProtectedRoute element={Tenants} />} />
            <Route path="/payments" element={<ProtectedRoute element={Payments} />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
