import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RoomsPage from './pages/rooms/RoomsPage';
import './App.css';
import AuthProvider from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';

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
            <Route path="settings" element={<div className="p-4 text-slate-500">Settings Module Coming Soon</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
