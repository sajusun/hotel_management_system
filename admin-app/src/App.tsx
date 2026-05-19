import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<div className="p-4 text-slate-500">Rooms Module Coming Soon</div>} />
          <Route path="reservations" element={<div className="p-4 text-slate-500">Reservations Module Coming Soon</div>} />
          <Route path="guests" element={<div className="p-4 text-slate-500">Guests Module Coming Soon</div>} />
          <Route path="billing" element={<div className="p-4 text-slate-500">Billing Module Coming Soon</div>} />
          <Route path="settings" element={<div className="p-4 text-slate-500">Settings Module Coming Soon</div>} />
        </Route>

        {/* Redirect root to dashboard (which redirects to login if unauth, handling later) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
