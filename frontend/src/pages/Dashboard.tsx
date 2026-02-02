import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, BookOpen, ClipboardCheck, TrendingUp, TrendingDown, Calendar, BarChart2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  todayAttendance: {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  };
  weeklyAverage: number;
  lowAttendanceCount: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    },
  });

  const statCards = [
    { 
      label: 'Total Students', 
      value: stats?.totalStudents || 0, 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/students'
    },
    { 
      label: 'Active Courses', 
      value: stats?.totalCourses || 0, 
      icon: BookOpen, 
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      link: '/courses'
    },
    { 
      label: "Today's Attendance", 
      value: `${stats?.todayAttendance?.percentage || 0}%`, 
      icon: ClipboardCheck, 
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      link: '/attendance',
      subtitle: stats?.todayAttendance?.total 
        ? `${stats.todayAttendance.present}/${stats.todayAttendance.total} present`
        : 'No records yet'
    },
    { 
      label: 'Low Attendance', 
      value: stats?.lowAttendanceCount || 0, 
      icon: stats?.lowAttendanceCount ? TrendingDown : TrendingUp, 
      gradient: stats?.lowAttendanceCount ? 'from-red-500 to-rose-600' : 'from-purple-500 to-purple-600',
      bgLight: stats?.lowAttendanceCount ? 'bg-red-50' : 'bg-purple-50',
      textColor: stats?.lowAttendanceCount ? 'text-red-600' : 'text-purple-600',
      link: '/reports',
      subtitle: 'Below 75%'
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-white/80 text-sm font-medium">Welcome to AttendEase</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Attendance Overview</h1>
          <p className="text-white/80 max-w-xl">
            Track student attendance, manage courses, and generate reports all in one place.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map(({ label, value, icon: Icon, gradient, textColor, link, subtitle }) => (
          <Link 
            key={label} 
            to={link}
            className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse" />
              ) : value}
            </p>
            {subtitle && (
              <p className={`text-xs mt-2 ${textColor} font-medium`}>{subtitle}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { to: '/attendance', icon: ClipboardCheck, label: 'Mark Attendance', color: 'indigo' },
            { to: '/students', icon: Users, label: 'Manage Students', color: 'emerald' },
            { to: '/timetable', icon: Calendar, label: 'View Timetable', color: 'amber' },
            { to: '/reports', icon: BarChart2, label: 'View Reports', color: 'purple' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link 
              key={to}
              to={to} 
              className={`p-6 bg-${color}-50 rounded-2xl text-${color}-600 hover:bg-${color}-100 transition-all text-center group hover:scale-105 hover:shadow-lg`}
            >
              <div className={`w-14 h-14 mx-auto mb-4 bg-${color}-100 rounded-xl flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
                <Icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Today's Attendance</h2>
          {stats?.todayAttendance?.total ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-gray-600 font-medium">Present</span>
                </div>
                <span className="font-bold text-emerald-600 text-lg">{stats.todayAttendance.present}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600 font-medium">Absent</span>
                </div>
                <span className="font-bold text-red-600 text-lg">{stats.todayAttendance.absent}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium">Attendance Rate</span>
                  <span className={`font-bold text-2xl ${stats.todayAttendance.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stats.todayAttendance.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${stats.todayAttendance.percentage >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                    style={{ width: `${stats.todayAttendance.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardCheck className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-3">No attendance marked today</p>
              <Link 
                to="/attendance" 
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Mark attendance now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">System Overview</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{stats?.totalStudents || 0} Students</p>
                <p className="text-sm text-gray-500">Enrolled across all courses</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{stats?.totalCourses || 0} Courses</p>
                <p className="text-sm text-gray-500">Active programs</p>
              </div>
            </div>
            {(stats?.lowAttendanceCount || 0) > 0 && (
              <Link 
                to="/reports"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border border-red-100 hover:border-red-200 transition-colors"
              >
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{stats?.lowAttendanceCount} Students</p>
                  <p className="text-sm text-gray-500">Need attendance improvement</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
