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
  BarChart2,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { path: '/students', label: 'Students', icon: Users, color: 'from-emerald-500 to-emerald-600' },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck, color: 'from-indigo-500 to-indigo-600' },
  { path: '/timetable', label: 'Timetable', icon: Calendar, color: 'from-amber-500 to-amber-600' },
  { path: '/reports', label: 'Reports', icon: BarChart2, color: 'from-purple-500 to-purple-600' },
  { path: '/courses', label: 'Courses', icon: BookOpen, color: 'from-rose-500 to-rose-600' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AttendEase
            </span>
          </div>
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-5 space-y-2">
          {navItems.map(({ path, label, icon: Icon, color }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r ' + color + ' text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="font-medium flex-1">{label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {user?.role?.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-30 border-b border-gray-100">
          <div className="flex items-center justify-between px-8 lg:px-10 py-5">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentPage?.label || 'Dashboard'}</h2>
                <p className="text-sm text-gray-500 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8 lg:p-10 min-h-[calc(100vh-80px)]">
          <div className="animate-slide-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
