import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { Calendar, Check, X, Clock, Users, CheckCircle2 } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Session {
  id: number;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
}

interface StudentAttendance {
  id: number;
  name: string;
  roll_number: string;
  attendance_status: string | null;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES: Record<string, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
  THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday'
};

export default function Attendance() {
  const queryClient = useQueryClient();
  const today = new Date();
  const currentDay = DAYS[today.getDay() === 0 ? 5 : today.getDay() - 1]; // Map Sunday to Saturday
  
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['timetable', selectedDay, selectedCourse],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('day', selectedDay);
      if (selectedCourse) params.append('courseId', selectedCourse.toString());
      const res = await api.get(`/timetable?${params}`);
      return res.data;
    },
    enabled: !!selectedCourse,
  });

  const { data: students, isLoading: loadingStudents } = useQuery<StudentAttendance[]>({
    queryKey: ['session-students', selectedSession?.id, selectedDate],
    queryFn: async () => {
      const res = await api.get(`/attendance/session-students?sessionId=${selectedSession?.id}&date=${selectedDate}`);
      const data = res.data;
      // Initialize attendance state from existing records
      const initial: Record<number, string> = {};
      data.forEach((s: StudentAttendance) => {
        if (s.attendance_status) {
          initial[s.id] = s.attendance_status;
        }
      });
      setAttendance(initial);
      return data;
    },
    enabled: !!selectedSession,
  });

  const markMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status,
      }));
      const res = await api.post('/attendance/mark', {
        sessionId: selectedSession?.id,
        date: selectedDate,
        records,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-students'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    if (!students) return;
    const all: Record<number, string> = {};
    students.forEach(s => { all[s.id] = 'present'; });
    setAttendance(all);
  };

  const getStatusStyles = (status: string, isSelected: boolean) => {
    const base = 'px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1';
    if (!isSelected) return `${base} bg-gray-100 text-gray-600 hover:bg-gray-200`;
    
    switch (status) {
      case 'present': return `${base} bg-emerald-500 text-white`;
      case 'absent': return `${base} bg-red-500 text-white`;
      case 'late': return `${base} bg-amber-500 text-white`;
      default: return `${base} bg-gray-100 text-gray-600`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          Attendance saved successfully!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500">Select a session from today's timetable</p>
      </div>

      {/* Step 1: Select Course & Day */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(Number(e.target.value) || null);
                setSelectedSession(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Choose a course...</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setSelectedSession(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{DAY_NAMES[day]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Select Session */}
      {selectedCourse && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{DAY_NAMES[selectedDay]}'s Sessions</h2>
          {sessions?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sessions scheduled for this day</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions?.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    selectedSession?.id === session.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{session.subject_name}</div>
                  <div className="text-sm text-gray-500">{session.subject_code}</div>
                  <div className="text-sm text-indigo-600 mt-2">
                    {session.start_time} - {session.end_time}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{session.teacher_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Mark Attendance */}
      {selectedSession && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedSession.subject_name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedSession.start_time} - {selectedSession.end_time} • {selectedDate}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={markAllPresent}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition text-sm font-medium"
                >
                  <Users className="w-4 h-4" />
                  Mark All Present
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">
                {students?.length || 0} Students
              </span>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="w-4 h-4" /> Present
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <X className="w-4 h-4" /> Absent
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="w-4 h-4" /> Late
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y max-h-[500px] overflow-y-auto">
            {loadingStudents ? (
              <div className="px-6 py-8 text-center text-gray-500">Loading students...</div>
            ) : (
              students?.map(student => (
                <div key={student.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.roll_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(['present', 'absent', 'late'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={getStatusStyles(status, attendance[student.id] === status)}
                      >
                        {status === 'present' && <Check className="w-4 h-4" />}
                        {status === 'absent' && <X className="w-4 h-4" />}
                        {status === 'late' && <Clock className="w-4 h-4" />}
                        <span className="hidden sm:inline capitalize">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {students && students.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  Marked: {Object.keys(attendance).length} / {students.length}
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-600">
                    Present: {Object.values(attendance).filter(s => s === 'present').length}
                  </span>
                  <span className="text-red-600">
                    Absent: {Object.values(attendance).filter(s => s === 'absent').length}
                  </span>
                  <span className="text-amber-600">
                    Late: {Object.values(attendance).filter(s => s === 'late').length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => markMutation.mutate()}
                disabled={markMutation.isPending || Object.keys(attendance).length === 0}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
