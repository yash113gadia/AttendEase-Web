import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { Clock, User, BookOpen, Calendar, LayoutGrid, List } from 'lucide-react';

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
  room?: string;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES: Record<string, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday',
  THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday'
};

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function Timetable() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['timetable', selectedCourse],
    queryFn: async () => {
      const params = selectedCourse ? `?courseId=${selectedCourse}` : '';
      const res = await api.get(`/timetable${params}`);
      return res.data;
    },
  });

  const getSessionsForSlot = (day: string, time: string) => {
    return sessions?.filter(s => 
      s.day_of_week === day && 
      s.start_time <= time && 
      s.end_time > time
    ) || [];
  };

  const getSessionColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
      'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
      'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-700',
      'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 text-rose-700',
      'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700',
      'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-700',
    ];
    return colors[index % colors.length];
  };

  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = sessions?.filter(s => s.day_of_week === day) || [];
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
            <p className="text-gray-500">Weekly class schedule</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition font-medium"
          >
            <option value="">All Courses</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
            ))}
          </select>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition ${viewMode === 'list' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading timetable...</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <th className="w-20 px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {DAY_NAMES[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-4 text-sm font-semibold text-gray-500 border-r border-gray-100">{time}</td>
                    {DAYS.map(day => {
                      const daySlotSessions = getSessionsForSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-2 py-2 border-r border-gray-100 last:border-r-0">
                          {daySlotSessions.map((session) => (
                            <div
                              key={session.id}
                              className={`p-2.5 rounded-xl border text-xs shadow-sm ${getSessionColor(session.id)}`}
                            >
                              <div className="font-bold truncate">{session.subject_code}</div>
                              <div className="truncate opacity-75 mt-0.5">{session.teacher_name}</div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {DAYS.map(day => (
            <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  {DAY_NAMES[day]}
                </h3>
              </div>
              {groupedByDay[day].length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No classes scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {groupedByDay[day].map((session) => (
                    <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-sm ${getSessionColor(session.id)}`}>
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{session.subject_name}</p>
                          <p className="text-sm text-gray-500 font-medium">{session.subject_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm font-medium">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          {session.start_time} - {session.end_time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <User className="w-4 h-4 text-indigo-500" />
                          {session.teacher_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {sessions && sessions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Subjects
          </h4>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(sessions.map(s => s.subject_code))).map((code, idx) => {
              const session = sessions.find(s => s.subject_code === code);
              return (
                <span
                  key={code}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getSessionColor(session?.id || idx)}`}
                >
                  {code}: {session?.subject_name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
