import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { Clock, User, BookOpen } from 'lucide-react';

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
      'bg-indigo-100 border-indigo-300 text-indigo-700',
      'bg-emerald-100 border-emerald-300 text-emerald-700',
      'bg-amber-100 border-amber-300 text-amber-700',
      'bg-rose-100 border-rose-300 text-rose-700',
      'bg-purple-100 border-purple-300 text-purple-700',
      'bg-cyan-100 border-cyan-300 text-cyan-700',
    ];
    return colors[index % colors.length];
  };

  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = sessions?.filter(s => s.day_of_week === day) || [];
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500">Weekly class schedule</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Courses</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500">
          Loading timetable...
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-20 px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                      {DAY_NAMES[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-500 border-r">{time}</td>
                    {DAYS.map(day => {
                      const daySlotSessions = getSessionsForSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-2 py-2 border-r last:border-r-0">
                          {daySlotSessions.map((session) => (
                            <div
                              key={session.id}
                              className={`p-2 rounded-lg border text-xs ${getSessionColor(session.id)}`}
                            >
                              <div className="font-medium truncate">{session.subject_code}</div>
                              <div className="truncate opacity-75">{session.teacher_name}</div>
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
            <div key={day} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <h3 className="font-semibold text-gray-900">{DAY_NAMES[day]}</h3>
              </div>
              {groupedByDay[day].length === 0 ? (
                <div className="px-6 py-4 text-gray-500 text-sm">No classes scheduled</div>
              ) : (
                <div className="divide-y">
                  {groupedByDay[day].map((session) => (
                    <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSessionColor(session.id)}`}>
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.subject_name}</p>
                          <p className="text-sm text-gray-500">{session.subject_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {session.start_time} - {session.end_time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
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
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">Subjects</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(sessions.map(s => s.subject_code))).map((code, idx) => {
              const session = sessions.find(s => s.subject_code === code);
              return (
                <span
                  key={code}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getSessionColor(session?.id || idx)}`}
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
