import { Navigate, useLocation } from 'react-router-dom';
import useAuth from './useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-700">Loading session…</div>
          <div className="text-xs text-slate-500 mt-1">Please wait</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
