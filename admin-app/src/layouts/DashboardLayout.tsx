import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BedDouble,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  User,
} from 'lucide-react';
import useAuth from '../auth/useAuth';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('hms.sidebar.collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const profileRef = useRef<HTMLDivElement | null>(null);

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

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem('hms.sidebar.collapsed', next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (profileRef.current.contains(e.target as Node)) return;
      setProfileOpen(false);
    };
    if (!profileOpen) return;
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [profileOpen]);

  const displayName = user?.name || user?.email || 'Admin';
  const initials = displayName.slice(0, 1).toUpperCase();

  const { pageTitle, breadcrumb } = useMemo(() => {
    const pathname = location.pathname;
    const match = navItems.find((i) => i.path === pathname) || (pathname === '/dashboard' ? navItems[0] : null);
    const title = match?.name || 'Dashboard';
    return {
      pageTitle: title,
      breadcrumb: ['Home', title],
    };
  }, [location.pathname, navItems]);

  return (
    <div className="h-dvh flex flex-col bg-slate-100">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center min-w-0">
          {/* Brand block */}
          <div
            className={[
              'h-16 hidden md:flex items-center gap-3 px-4 border-r border-slate-200',
              collapsed ? 'w-[84px] justify-center' : 'w-64 justify-between',
            ].join(' ')}
          >
            <div className={['min-w-0', collapsed ? 'hidden' : 'block'].join(' ')}>
              <div className="text-sm font-semibold text-slate-900 truncate">HMS Admin</div>
              <div className="text-[11px] text-slate-500 truncate">Hotel Management System</div>
            </div>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-700"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 sm:px-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-700"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-700"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-700 relative"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-50"
              aria-label="Open profile menu"
            >
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold">
                {initials}
              </div>
              <div className="hidden lg:block text-left max-w-[200px]">
                <div className="text-sm font-semibold text-slate-900 leading-4 truncate">{displayName}</div>
                <div className="text-xs text-slate-500 leading-4 truncate">{user?.email || 'Admin Account'}</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{user?.email || 'Admin Account'}</div>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/dashboard/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    Profile & Settings
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 md:flex">
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
            collapsed ? 'w-72 md:w-[84px]' : 'w-72 md:w-64',
            'bg-white border-r border-slate-200 flex flex-col',
            'transform transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          <div className={['h-16 px-4 md:hidden flex items-center justify-between border-b border-slate-200'].join(' ')}>
            <div className="text-sm font-semibold text-slate-900">Menu</div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 text-slate-600"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-4">
            <div className={['text-[11px] font-semibold text-slate-400 uppercase tracking-wider', collapsed ? 'md:hidden' : ''].join(' ')}>
              Menu
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'md:justify-center md:px-3' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon className={['w-5 h-5', collapsed ? 'md:mr-0' : 'mr-3'].join(' ')} />
                <span className={collapsed ? 'md:hidden' : ''}>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200">
            <button
              type="button"
              onClick={signOut}
              className={[
                'flex items-center w-full py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors',
                collapsed ? 'md:justify-center md:px-3' : 'px-4',
              ].join(' ')}
            >
              <LogOut className={['w-5 h-5', collapsed ? 'md:mr-0' : 'mr-3'].join(' ')} />
              <span className={collapsed ? 'md:hidden' : ''}>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="bg-slate-200/70 border-b border-slate-200">
            <div className="px-4 sm:px-6 md:px-8 py-5 flex items-start justify-between gap-6">
              <div>
                <div className="text-2xl font-semibold text-slate-900">{pageTitle}</div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <span className="text-slate-500">{breadcrumb[0]}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700 font-medium">{breadcrumb[1]}</span>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 md:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
