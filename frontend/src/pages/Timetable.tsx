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

  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = sessions?.filter(s => s.day_of_week === day) || [];
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
        >
          <option value="">All Courses</option>
          {courses?.map(course => (
            <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
          ))}
        </select>
        <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 transition ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="w-20 px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-3 py-3 text-center text-xs font-medium text-zinc-500 uppercase">
                      {DAY_NAMES[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 text-sm text-zinc-500 border-r border-zinc-100">{time}</td>
                    {DAYS.map(day => {
                      const daySlotSessions = getSessionsForSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-2 py-2 border-r border-zinc-100 last:border-r-0">
                          {daySlotSessions.map((session) => (
                            <div
                              key={session.id}
                              className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-xs"
                            >
                              <div className="font-medium text-blue-700">{session.subject_code}</div>
                              <div className="text-blue-500 mt-0.5">{session.teacher_name}</div>
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
            <div key={day} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100">
                <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  {DAY_NAMES[day]}
                </h3>
              </div>
              {groupedByDay[day].length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <BookOpen className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No classes</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {groupedByDay[day].map((session) => (
                    <div key={session.id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{session.subject_name}</p>
                          <p className="text-xs text-zinc-500">{session.subject_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.start_time} - {session.end_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {session.teacher_name}
                        </span>
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
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Subjects</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(sessions.map(s => s.subject_code))).map((code) => {
              const session = sessions.find(s => s.subject_code === code);
              return (
                <span
                  key={code}
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700"
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
