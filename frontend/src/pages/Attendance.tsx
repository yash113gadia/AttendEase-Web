import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { Calendar, Check, X, Clock, Users, CheckCircle2, ClipboardCheck, BookOpen } from 'lucide-react';

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
    const base = 'px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border-2';
    if (!isSelected) return `${base} bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300`;
    
    switch (status) {
      case 'present': return `${base} bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30`;
      case 'absent': return `${base} bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30`;
      case 'late': return `${base} bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30`;
      default: return `${base} bg-gray-50 text-gray-500 border-gray-200`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold">Success!</p>
            <p className="text-sm text-emerald-100">Attendance saved successfully</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ClipboardCheck className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-500">Select a session to mark student attendance</p>
        </div>
      </div>

      {/* Step 1: Select Course & Day */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Step 1: Select Class</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => {
                setSelectedCourse(Number(e.target.value) || null);
                setSelectedSession(null);
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="">Choose a course...</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setSelectedSession(null);
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition"
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{DAY_NAMES[day]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Select Session */}
      {selectedCourse && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Step 2: Select Session</h3>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            {DAY_NAMES[selectedDay]}'s Sessions
          </h2>
          {sessions?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No sessions scheduled for this day</p>
              <p className="text-gray-400 text-sm mt-1">Try selecting a different day</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions?.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    selectedSession?.id === session.id
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/10'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-900">{session.subject_name}</div>
                    {selectedSession?.id === session.id && (
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{session.subject_code}</div>
                  <div className="flex items-center gap-2 text-sm text-indigo-600 mt-3 font-semibold">
                    <Clock className="w-4 h-4" />
                    {session.start_time} - {session.end_time}
                  </div>
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.teacher_name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Mark Attendance */}
      {selectedSession && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedSession.subject_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedSession.start_time} - {selectedSession.end_time} • {selectedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={markAllPresent}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/30 font-semibold"
              >
                <Users className="w-4 h-4" />
                Mark All Present
              </button>
            </div>
          </div>

          <div className="p-4 border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                {students?.length || 0} Students
              </span>
              <div className="flex gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Check className="w-4 h-4" /> Present
                </span>
                <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                  <X className="w-4 h-4" /> Absent
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" /> Late
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
            {loadingStudents ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading students...</p>
              </div>
            ) : (
              students?.map(student => (
                <div key={student.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
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
            <div className="p-5 border-t bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-600">
                  Marked: <span className="text-indigo-600">{Object.keys(attendance).length}</span> / {students.length}
                </div>
                <div className="flex gap-4 text-sm font-semibold">
                  <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                    Present: {Object.values(attendance).filter(s => s === 'present').length}
                  </span>
                  <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                    Absent: {Object.values(attendance).filter(s => s === 'absent').length}
                  </span>
                  <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                    Late: {Object.values(attendance).filter(s => s === 'late').length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => markMutation.mutate()}
                disabled={markMutation.isPending || Object.keys(attendance).length === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                {markMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-5 h-5" />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
