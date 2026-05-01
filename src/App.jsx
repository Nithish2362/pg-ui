import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader } from '@mantine/core';
import './App.css';
import { ModuleJson } from './moduleData/ModuleJson';

// Lazy loading components
const Login = lazy(() => import('./components/login/AdminLogin'));
const Layout = lazy(() => import('./layout/Layout'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Locations = lazy(() => import('./components/settings/location/LocationDetails'));
const Buildings = lazy(() => import('./components/settings/warehouse/Building'));
const Floors = lazy(() => import('./components/settings/warehouse/Floor'));
const Rooms = lazy(() => import('./components/settings/warehouse/Room'));
const Beds = lazy(() => import('./components/settings/warehouse/Bed'));
const Tenants = lazy(() => import('./components/crm/Tenants'));
const Payments = lazy(() => import('./components/settings/payment/Payments'));
const NotificationsHub = lazy(() => import('./components/crm/NotificationsHub'));
const TenantDashboard = lazy(() => import('./components/tenant/TenantDashboard'));
const NotFound = lazy(() => import('./common/NotFound'));

const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Use ModuleJson to check permissions
  const allViews = ModuleJson(null);
  const flattenedViews = [];
  const flatten = (views) => {
    views.forEach(v => {
      flattenedViews.push(v);
      if (v.children) flatten(v.children);
    });
  };
  flatten(allViews);

  if (flattenedViews.length > 0) {
    const isAllowed = flattenedViews.some(view => location.pathname.startsWith(view.path));
    if (!isAllowed && location.pathname !== '/dashboard' && location.pathname !== '/') {
      return <Navigate to="/dashboard" />;
    }
  }

  return <Component />;
};

function App() {
  return (
    <Suspense fallback={
      <div className="loading-container">
        <p className="loading-text">Loading</p>
        <Loader color="#3f92c5" style={{ marginLeft: "0.5rem", display: "flex", alignItems: "center", height: "1.5rem" }} type="dots" />
      </div>
    }>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />

          {/* Property */}
          <Route path="/locations" element={<ProtectedRoute element={Locations} />} />
          <Route path="/locations/create" element={<ProtectedRoute element={Locations} />} />
          <Route path="/buildings" element={<ProtectedRoute element={Buildings} />} />
          <Route path="/buildings/create" element={<ProtectedRoute element={Buildings} />} />
          <Route path="/floors" element={<ProtectedRoute element={Floors} />} />
          <Route path="/floors/create" element={<ProtectedRoute element={Floors} />} />
          <Route path="/rooms" element={<ProtectedRoute element={Rooms} />} />
          <Route path="/rooms/create" element={<ProtectedRoute element={Rooms} />} />
          <Route path="/beds" element={<ProtectedRoute element={Beds} />} />
          <Route path="/beds/create" element={<ProtectedRoute element={Beds} />} />

          {/* Residents */}
          <Route path="/tenants" element={<ProtectedRoute element={Tenants} />} />
          <Route path="/tenants/create" element={<ProtectedRoute element={Tenants} />} />
          <Route path="/payments" element={<ProtectedRoute element={Payments} />} />
          <Route path="/payments/create" element={<ProtectedRoute element={Payments} />} />

          {/* Notifications */}
          <Route path="/notifications" element={<ProtectedRoute element={NotificationsHub} />} />

          {/* Tenant Portal */}
          <Route path="/tenant/dashboard" element={<ProtectedRoute element={TenantDashboard} />} />
          <Route path="/tenant/payments" element={<ProtectedRoute element={Payments} />} />
          <Route path="/tenant/profile" element={<ProtectedRoute element={TenantDashboard} />} />

          {/* Root redirects */}
          <Route path="/property" element={<Navigate to="/locations" />} />
          <Route path="/residents" element={<Navigate to="/tenants" />} />
          <Route path="/notifications" element={<Navigate to="/notifications" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>

        <Route path="*" element={<ProtectedRoute element={NotFound} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
