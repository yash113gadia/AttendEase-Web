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
  const currentDay = DAYS[today.getDay() === 0 ? 5 : today.getDay() - 1];
  
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
      const initial: Record<number, string> = {};
      data.forEach((s: StudentAttendance) => {
        if (s.attendance_status) initial[s.id] = s.attendance_status;
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

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Attendance saved</span>
        </div>
      )}

      {/* Step 1: Select Course & Day */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-4">Step 1: Select Class</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Course</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => { setSelectedCourse(Number(e.target.value) || null); setSelectedSession(null); }}
              className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select course</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => { setSelectedDay(e.target.value); setSelectedSession(null); }}
              className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{DAY_NAMES[day]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Select Session */}
      {selectedCourse && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-4">Step 2: Select Session</p>
          {sessions?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No sessions for {DAY_NAMES[selectedDay]}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessions?.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedSession?.id === session.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{session.subject_name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{session.subject_code}</p>
                    </div>
                    {selectedSession?.id === session.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {session.start_time} - {session.end_time}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Mark Attendance */}
      {selectedSession && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900">{selectedSession.subject_name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{selectedSession.start_time} - {selectedSession.end_time} • {selectedDate}</p>
            </div>
            <button
              onClick={markAllPresent}
              className="text-sm px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Mark All Present
            </button>
          </div>

          <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
            {loadingStudents ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              students?.map(student => (
                <div key={student.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-xs font-medium">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{student.name}</p>
                      <p className="text-xs text-zinc-500">{student.roll_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {(['present', 'absent', 'late'] as const).map(status => {
                      const isSelected = attendance[student.id] === status;
                      const styles = {
                        present: isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-zinc-500 border-zinc-200 hover:border-emerald-300',
                        absent: isSelected ? 'bg-red-500 text-white border-red-500' : 'bg-white text-zinc-500 border-zinc-200 hover:border-red-300',
                        late: isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-zinc-500 border-zinc-200 hover:border-amber-300',
                      };
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${styles[status]}`}
                        >
                          {status === 'present' && <Check className="w-3.5 h-3.5" />}
                          {status === 'absent' && <X className="w-3.5 h-3.5" />}
                          {status === 'late' && <Clock className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline capitalize">{status}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {students && students.length > 0 && (
            <div className="p-5 border-t border-zinc-100 bg-zinc-50">
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-zinc-600">
                  Marked: <span className="font-medium text-zinc-900">{Object.keys(attendance).length}</span> / {students.length}
                </span>
                <div className="flex gap-3 text-xs font-medium">
                  <span className="text-emerald-600">{Object.values(attendance).filter(s => s === 'present').length} Present</span>
                  <span className="text-red-600">{Object.values(attendance).filter(s => s === 'absent').length} Absent</span>
                  <span className="text-amber-600">{Object.values(attendance).filter(s => s === 'late').length} Late</span>
                </div>
              </div>
              <button
                onClick={() => markMutation.mutate()}
                disabled={markMutation.isPending || Object.keys(attendance).length === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {markMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Attendance'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
