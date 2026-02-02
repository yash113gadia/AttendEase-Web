import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { AlertTriangle, Download, TrendingUp, Calendar } from 'lucide-react';

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
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Overall Rate</p>
          <p className="text-2xl font-semibold text-zinc-900 mt-1">{overallPercentage}%</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Present</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">{overallStats?.present || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Absent</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{overallStats?.absent || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Low Attendance</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{lowAttendance?.length || 0}</p>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <p className="font-medium text-zinc-900">Daily Trend</p>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Courses</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
        <div className="p-5">
          {loadingSummary ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : summary?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {summary?.slice(0, 10).map((day) => {
                const percentage = day.total ? Math.round((parseInt(String(day.present)) / parseInt(String(day.total))) * 100) : 0;
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-zinc-500">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 h-7 bg-zinc-100 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all ${
                          percentage >= 75 ? 'bg-emerald-400' : percentage >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700">
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
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-zinc-900">Low Attendance</p>
              <p className="text-xs text-zinc-500">Below {threshold}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={50}>50%</option>
              <option value={60}>60%</option>
              <option value={75}>75%</option>
              <option value={80}>80%</option>
            </select>
            <button
              onClick={exportLowAttendanceCSV}
              disabled={!lowAttendance?.length}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Roll No.</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Classes</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loadingLow ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center">
                    <div className="w-8 h-8 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : lowAttendance?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center">
                    <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No students below {threshold}%</p>
                  </td>
                </tr>
              ) : (
                lowAttendance?.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3 text-sm text-zinc-600">{student.roll_number}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-medium">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-600">{student.course_name || '-'}</td>
                    <td className="px-5 py-3 text-sm text-zinc-600">
                      {student.present_count}/{student.total_classes}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        student.percentage >= 75 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : student.percentage >= 50 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-red-50 text-red-700'
                      }`}>
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
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Daily Attendance Trend
            </h2>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading trend data...</p>
            </div>
          ) : summary?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No attendance data yet</p>
              <p className="text-gray-400 text-sm mt-1">Start marking attendance to see trends</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary?.slice(0, 10).map((day) => {
                const percentage = day.total ? Math.round((parseInt(String(day.present)) / parseInt(String(day.total))) * 100) : 0;
                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-semibold text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 h-10 bg-gray-100 rounded-xl overflow-hidden relative">
                      <div
                        className={`h-full rounded-xl transition-all ${
                          percentage >= 75 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                            : percentage >= 50 
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-red-50 via-amber-50 to-orange-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Low Attendance Students</h2>
                <p className="text-sm text-gray-500">Students below {threshold}% attendance threshold</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-600">Threshold:</label>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Classes</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingLow ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading students...</p>
                  </td>
                </tr>
              ) : lowAttendance?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Great job!</p>
                    <p className="text-gray-500 mt-1">No students below {threshold}% attendance</p>
                  </td>
                </tr>
              ) : (
                lowAttendance?.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">{student.roll_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{student.course_name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg font-semibold text-gray-700">
                        {student.present_count} / {student.total_classes}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold ${getAttendanceColor(student.percentage)}`}>
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
