import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, BookOpen, ClipboardCheck, TrendingDown, Calendar, BarChart2, ArrowUpRight } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/students" className="bg-white rounded-xl p-5 border border-zinc-200 hover:border-zinc-300 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            {isLoading ? <span className="inline-block w-12 h-7 bg-zinc-100 rounded animate-pulse" /> : stats?.totalStudents || 0}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">Total Students</p>
        </Link>

        <Link to="/courses" className="bg-white rounded-xl p-5 border border-zinc-200 hover:border-zinc-300 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            {isLoading ? <span className="inline-block w-12 h-7 bg-zinc-100 rounded animate-pulse" /> : stats?.totalCourses || 0}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">Active Courses</p>
        </Link>

        <Link to="/attendance" className="bg-white rounded-xl p-5 border border-zinc-200 hover:border-zinc-300 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            {isLoading ? <span className="inline-block w-12 h-7 bg-zinc-100 rounded animate-pulse" /> : `${stats?.todayAttendance?.percentage || 0}%`}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">Today's Attendance</p>
        </Link>

        <Link to="/reports" className="bg-white rounded-xl p-5 border border-zinc-200 hover:border-zinc-300 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${stats?.lowAttendanceCount ? 'bg-red-50' : 'bg-zinc-50'} rounded-lg flex items-center justify-center`}>
              <TrendingDown className={`w-5 h-5 ${stats?.lowAttendanceCount ? 'text-red-500' : 'text-zinc-400'}`} />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400" />
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            {isLoading ? <span className="inline-block w-12 h-7 bg-zinc-100 rounded animate-pulse" /> : stats?.lowAttendanceCount || 0}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">Low Attendance</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/attendance" className="flex items-center gap-3 p-4 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            <ClipboardCheck className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-zinc-700">Mark Attendance</span>
          </Link>
          <Link to="/students" className="flex items-center gap-3 p-4 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            <Users className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-zinc-700">Manage Students</span>
          </Link>
          <Link to="/timetable" className="flex items-center gap-3 p-4 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-zinc-700">View Timetable</span>
          </Link>
          <Link to="/reports" className="flex items-center gap-3 p-4 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-zinc-700">View Reports</span>
          </Link>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">Today's Attendance</h2>
          {stats?.todayAttendance?.total ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-zinc-600">Present</span>
                </div>
                <span className="font-semibold text-zinc-900">{stats.todayAttendance.present}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-zinc-600">Absent</span>
                </div>
                <span className="font-semibold text-zinc-900">{stats.todayAttendance.absent}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600">Attendance Rate</span>
                  <span className={`text-lg font-semibold ${stats.todayAttendance.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stats.todayAttendance.percentage}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${stats.todayAttendance.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${stats.todayAttendance.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500 mb-3">No attendance marked today</p>
              <Link to="/attendance" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Mark attendance →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{stats?.totalStudents || 0} Students</p>
                <p className="text-xs text-zinc-500">Enrolled across all courses</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{stats?.totalCourses || 0} Courses</p>
                <p className="text-xs text-zinc-500">Active programs</p>
              </div>
            </div>
            {(stats?.lowAttendanceCount || 0) > 0 && (
              <Link to="/reports" className="flex items-center gap-4 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">{stats?.lowAttendanceCount} Students</p>
                  <p className="text-xs text-zinc-500">Need attendance improvement</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
