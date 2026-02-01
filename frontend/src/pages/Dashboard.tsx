import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Calendar, BarChart2 } from 'lucide-react';
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
      color: 'bg-blue-500',
      link: '/students'
    },
    { 
      label: 'Active Courses', 
      value: stats?.totalCourses || 0, 
      icon: BookOpen, 
      color: 'bg-emerald-500',
      link: '/courses'
    },
    { 
      label: "Today's Attendance", 
      value: `${stats?.todayAttendance?.percentage || 0}%`, 
      icon: ClipboardCheck, 
      color: 'bg-amber-500',
      link: '/attendance',
      subtitle: stats?.todayAttendance?.total 
        ? `${stats.todayAttendance.present}/${stats.todayAttendance.total} present`
        : 'No records'
    },
    { 
      label: 'Low Attendance', 
      value: stats?.lowAttendanceCount || 0, 
      icon: TrendingUp, 
      color: stats?.lowAttendanceCount ? 'bg-red-500' : 'bg-purple-500',
      link: '/reports',
      subtitle: 'Below 75%'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your attendance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color, link, subtitle }) => (
          <Link 
            key={label} 
            to={link}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? '...' : value}
                </p>
                {subtitle && (
                  <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
              </div>
              <div className={`${color} p-3 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/attendance" 
            className="p-4 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition text-center"
          >
            <ClipboardCheck className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mark Attendance</span>
          </Link>
          <Link 
            to="/students" 
            className="p-4 bg-emerald-50 rounded-xl text-emerald-600 hover:bg-emerald-100 transition text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Students</span>
          </Link>
          <Link 
            to="/timetable" 
            className="p-4 bg-amber-50 rounded-xl text-amber-600 hover:bg-amber-100 transition text-center"
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Timetable</span>
          </Link>
          <Link 
            to="/reports" 
            className="p-4 bg-purple-50 rounded-xl text-purple-600 hover:bg-purple-100 transition text-center"
          >
            <BarChart2 className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Reports</span>
          </Link>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          {stats?.todayAttendance?.total ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Present</span>
                <span className="font-semibold text-emerald-600">{stats.todayAttendance.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent</span>
                <span className="font-semibold text-red-600">{stats.todayAttendance.absent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Records</span>
                <span className="font-semibold text-gray-900">{stats.todayAttendance.total}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className={`font-bold text-lg ${stats.todayAttendance.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stats.todayAttendance.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${stats.todayAttendance.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${stats.todayAttendance.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No attendance marked today</p>
              <Link to="/attendance" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
                Mark attendance now →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{stats?.totalStudents || 0} Students</p>
                <p className="text-sm text-gray-500">Enrolled across all courses</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="font-medium text-gray-900">{stats?.totalCourses || 0} Courses</p>
                <p className="text-sm text-gray-500">Active programs</p>
              </div>
            </div>
            {(stats?.lowAttendanceCount || 0) > 0 && (
              <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">{stats?.lowAttendanceCount} Students</p>
                  <p className="text-sm text-gray-500">Need attendance improvement</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
