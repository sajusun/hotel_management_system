import { useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, BedDouble, Receipt, Settings, LogOut, Menu, X } from 'lucide-react';
import useAuth from '../auth/useAuth';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Rooms', path: '/dashboard/rooms', icon: BedDouble },
      { name: 'Reservations', path: '/dashboard/reservations', icon: CalendarDays },
      { name: 'Guests', path: '/dashboard/guests', icon: Users },
      { name: 'Billing', path: '/dashboard/billing', icon: Receipt },
      { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ],
    [],
  );

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-dvh bg-slate-50 md:flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:static inset-y-0 left-0 z-50 md:z-auto',
          'w-72 md:w-64 bg-white border-r border-slate-200 flex flex-col',
          'transform transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-indigo-600">HMS Admin</h2>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-600"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            type="button"
            onClick={signOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 md:ml-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-700"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="md:hidden text-sm font-semibold text-slate-900">HMS Admin</div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {user?.name || user?.email || 'Admin'}
            </span>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
