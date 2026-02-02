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
