import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useState } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';

interface Student {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
}

interface Course {
  id: number;
  courseName: string;
}

export default function Attendance() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  const { data: students } = useQuery<Student[]>({
    queryKey: ['students', selectedCourse],
    queryFn: async () => {
      const res = await api.get(`/students/course/${selectedCourse}`);
      return res.data;
    },
    enabled: !!selectedCourse,
  });

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    // TODO: Submit attendance to API
    console.log('Submitting:', { date: selectedDate, courseId: selectedCourse, attendance });
    alert('Attendance marked successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500">Record student attendance for today</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Choose a course...</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>{course.courseName}</option>
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

      {/* Attendance List */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">
                {students?.length || 0} Students
              </span>
              <div className="flex gap-2 text-sm">
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

          <div className="divide-y">
            {students?.map(student => (
              <div key={student.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                  <p className="text-sm text-gray-500">{student.rollNumber}</p>
                </div>
                <div className="flex gap-2">
                  {(['PRESENT', 'ABSENT', 'LATE'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(student.id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        attendance[student.id] === status
                          ? status === 'PRESENT' ? 'bg-emerald-500 text-white'
                          : status === 'ABSENT' ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'PRESENT' && <Check className="w-4 h-4 inline" />}
                      {status === 'ABSENT' && <X className="w-4 h-4 inline" />}
                      {status === 'LATE' && <Clock className="w-4 h-4 inline" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {students && students.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Submit Attendance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
