import { Navigate, useLocation } from 'react-router-dom';
import useAuth from './useAuth';

export default function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const role = user.role || '';
  if (roles.length && !roles.includes(role)) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="text-sm font-semibold text-slate-900">Access denied</div>
        <div className="text-sm text-slate-600 mt-1">You don’t have permission to view this page.</div>
      </div>
    );
  }

  return children;
}

