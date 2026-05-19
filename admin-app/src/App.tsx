import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RoomsPage from './pages/rooms/RoomsPage';
import SiteSettingsPage from './pages/settings/SiteSettingsPage';
import SubscribersPage from './pages/newsletter/SubscribersPage';
import SupportInboxPage from './pages/support/SupportInboxPage';
import SupportThreadPage from './pages/support/SupportThreadPage';
import './App.css';
import AuthProvider from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import RequireRole from './auth/RequireRole';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="reservations" element={<div className="p-4 text-slate-500">Reservations Module Coming Soon</div>} />
            <Route path="guests" element={<div className="p-4 text-slate-500">Guests Module Coming Soon</div>} />
            <Route path="billing" element={<div className="p-4 text-slate-500">Billing Module Coming Soon</div>} />
            <Route
              path="newsletter/subscribers"
              element={
                <RequireRole roles={['admin', 'help_desk']}>
                  <SubscribersPage />
                </RequireRole>
              }
            />
            <Route
              path="support"
              element={
                <RequireRole roles={['admin', 'help_desk']}>
                  <SupportInboxPage />
                </RequireRole>
              }
            />
            <Route
              path="support/:id"
              element={
                <RequireRole roles={['admin', 'help_desk']}>
                  <SupportThreadPage />
                </RequireRole>
              }
            />
            <Route
              path="settings"
              element={
                <RequireRole roles={['admin']}>
                  <SiteSettingsPage />
                </RequireRole>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
