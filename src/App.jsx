import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Lazy loading components
const Login = lazy(() => import('./components/login/AdminLogin'));
const Layout = lazy(() => import('./layout/Layout'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Floors = lazy(() => import('./components/settings/warehouse/Floor'));
const Rooms = lazy(() => import('./components/settings/warehouse/Room'));
const Tenants = lazy(() => import('./components/crm/Tenants'));
const Payments = lazy(() => import('./components/settings/payment/Payments'));
const Locations = lazy(() => import('./components/settings/location/LocationDetails'));
const Buildings = lazy(() => import('./components/settings/warehouse/Building'));
const NotFound = lazy(() => import('./common/NotFound'));

const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.views?.length > 0) {
    const isAllowed = user.views.some(view => location.pathname.includes(view.path));
    if (!isAllowed && location.pathname !== '/dashboard') {
      return <Navigate to="/dashboard" />;
    }
  }

  return <Component />;
};

function App() {
  return (
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

        <Route path="*" element={<ProtectedRoute element={NotFound} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
