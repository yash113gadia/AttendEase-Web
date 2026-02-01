import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  const stats = [
    { label: 'Total Students', value: '156', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Courses', value: courses?.length || '0', icon: BookOpen, color: 'bg-emerald-500' },
    { label: 'Today\'s Attendance', value: '89%', icon: ClipboardCheck, color: 'bg-amber-500' },
    { label: 'Weekly Average', value: '92%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition">
            <ClipboardCheck className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mark Attendance</span>
          </button>
          <button className="p-4 bg-emerald-50 rounded-xl text-emerald-600 hover:bg-emerald-100 transition">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Add Student</span>
          </button>
          <button className="p-4 bg-amber-50 rounded-xl text-amber-600 hover:bg-amber-100 transition">
            <BookOpen className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">New Course</span>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl text-purple-600 hover:bg-purple-100 transition">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'Attendance marked for B.Tech CS 2025', time: '2 hours ago' },
            { action: 'New student added: John Doe', time: '5 hours ago' },
            { action: 'Course schedule updated', time: 'Yesterday' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <span className="text-gray-700">{item.action}</span>
              <span className="text-sm text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
