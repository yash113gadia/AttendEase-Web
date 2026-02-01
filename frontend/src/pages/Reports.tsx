import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { AlertTriangle, Download, TrendingDown, TrendingUp, BarChart2 } from 'lucide-react';

interface LowAttendanceStudent {
  id: number;
  name: string;
  roll_number: string;
  course_name: string;
  total_classes: number;
  present_count: number;
  percentage: number;
}

interface AttendanceSummary {
  date: string;
  present: number;
  absent: number;
  total: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

export default function Reports() {
  const [threshold, setThreshold] = useState(75);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  const { data: lowAttendance, isLoading: loadingLow } = useQuery<LowAttendanceStudent[]>({
    queryKey: ['low-attendance', threshold],
    queryFn: async () => {
      const res = await api.get(`/reports/low-attendance?threshold=${threshold}`);
      return res.data;
    },
  });

  const { data: summary, isLoading: loadingSummary } = useQuery<AttendanceSummary[]>({
    queryKey: ['attendance-summary', selectedCourse],
    queryFn: async () => {
      const params = selectedCourse ? `?courseId=${selectedCourse}` : '';
      const res = await api.get(`/reports/attendance-summary${params}`);
      return res.data;
    },
  });

  const exportLowAttendanceCSV = () => {
    if (!lowAttendance) return;
    const csv = [
      'Roll Number,Name,Course,Total Classes,Present,Percentage',
      ...lowAttendance.map(s => 
        `${s.roll_number},${s.name},${s.course_name || ''},${s.total_classes},${s.present_count},${s.percentage}%`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low_attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-emerald-600 bg-emerald-100';
    if (percentage >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const overallStats = summary?.reduce((acc, day) => ({
    present: acc.present + parseInt(String(day.present)),
    absent: acc.absent + parseInt(String(day.absent)),
    total: acc.total + parseInt(String(day.total)),
  }), { present: 0, absent: 0, total: 0 });

  const overallPercentage = overallStats?.total 
    ? Math.round((overallStats.present / overallStats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Attendance analytics and insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{overallPercentage}%</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              overallPercentage >= 75 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {overallPercentage >= 75 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Present</p>
              <p className="text-2xl font-bold text-emerald-600">{overallStats?.present || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Absent</p>
              <p className="text-2xl font-bold text-red-600">{overallStats?.absent || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Attendance</p>
              <p className="text-2xl font-bold text-amber-600">{lowAttendance?.length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Daily Attendance Trend</h2>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All Courses</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6">
          {loadingSummary ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : summary?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance data yet</p>
          ) : (
            <div className="space-y-3">
              {summary?.slice(0, 10).map((day) => {
                const percentage = day.total ? Math.round((parseInt(String(day.present)) / parseInt(String(day.total))) * 100) : 0;
                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                        {day.present}/{day.total} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Low Attendance Report */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-red-50 to-amber-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Low Attendance Students</h2>
                <p className="text-sm text-gray-500">Students below {threshold}% attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Threshold:</label>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value={50}>50%</option>
                <option value={60}>60%</option>
                <option value={75}>75%</option>
                <option value={80}>80%</option>
                <option value={90}>90%</option>
              </select>
              <button
                onClick={exportLowAttendanceCSV}
                disabled={!lowAttendance?.length}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Roll Number</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Course</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Classes</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loadingLow ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : lowAttendance?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <TrendingUp className="w-8 h-8 text-emerald-500" />
                      <span>Great! No students below {threshold}% attendance</span>
                    </div>
                  </td>
                </tr>
              ) : (
                lowAttendance?.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.roll_number}</td>
                    <td className="px-6 py-4 text-gray-700">{student.name}</td>
                    <td className="px-6 py-4 text-gray-700">{student.course_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {student.present_count} / {student.total_classes}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(student.percentage)}`}>
                        {student.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
