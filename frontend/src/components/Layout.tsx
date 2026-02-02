import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Menu,
  X,
  Calendar,
  BarChart2
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/timetable', label: 'Timetable', icon: Calendar },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
  { path: '/courses', label: 'Courses', icon: BookOpen },
];

export default function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = navItems.find(n => n.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-zinc-100 text-zinc-600"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-zinc-900">AttendEase</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-500">
            <span>{current}</span>
            <span className="text-zinc-300">•</span>
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 text-xs text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Online
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-zinc-600 hover:bg-zinc-100 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Button strip navigation */}
        <nav className="max-w-7xl mx-auto px-4 lg:px-8 py-2 border-t border-zinc-100">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm border transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-zinc-200 transform transition-transform duration-200 lg:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-zinc-900">AttendEase</span>
          </div>
          <button
            className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-md"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page content */}
      <main className="px-4 lg:px-8 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
