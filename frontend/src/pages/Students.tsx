import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Search, Trash2, Upload, Download, X, UserPlus, Users, GraduationCap } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface Student {
  id: number;
  roll_number: string;
  name: string;
  email: string;
  course_name?: string;
  course_code?: string;
  attendance_percentage?: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

export default function Students() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ rollNumber: '', name: '', email: '', courseId: '' });

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['students', selectedCourse, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCourse !== 'all') params.append('courseId', selectedCourse);
      if (search) params.append('search', search);
      const res = await api.get(`/students?${params}`);
      return res.data;
    },
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof newStudent) => {
      const res = await api.post('/students', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowAddModal(false);
      setNewStudent({ rollNumber: '', name: '', email: '', courseId: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (studentsData: Array<{ rollNumber: string; name: string; email: string; courseId: number }>) => {
      const res = await api.post('/students/import', { students: studentsData });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert(`Successfully imported ${data.imported} students!`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const header = lines[0].toLowerCase();
      
      // Skip header row if present
      const dataLines = header.includes('roll') || header.includes('name') ? lines.slice(1) : lines;
      
      const studentsData = dataLines.map(line => {
        const [rollNumber, name, email] = line.split(',').map(s => s.trim());
        return {
          rollNumber,
          name,
          email: email || '',
          courseId: parseInt(selectedCourse) || 1
        };
      }).filter(s => s.rollNumber && s.name);

      if (studentsData.length > 0) {
        importMutation.mutate(studentsData);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportToCSV = () => {
    if (!students) return;
    const csv = [
      'Roll Number,Name,Email,Course,Attendance %',
      ...students.map(s => `${s.roll_number},${s.name},${s.email || ''},${s.course_name || ''},${s.attendance_percentage || 0}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (percentage >= 50) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500">
              {isLoading ? 'Loading...' : `${students?.length || 0} students enrolled`}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all min-w-[200px]"
          >
            <option value="all">All Courses</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                {isAdmin && <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 animate-pulse" /></td>
                  </tr>
                ))
              ) : students?.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No students found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                students?.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {student.roll_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {student.course_code || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{student.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${getAttendanceColor(student.attendance_percentage || 0)}`}>
                        {student.attendance_percentage || 0}%
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${student.name}?`)) {
                              deleteMutation.mutate(student.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
                  <p className="text-sm text-gray-500">Fill in the student details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(newStudent); }} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number *</label>
                <input
                  type="text"
                  required
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g., 2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g., john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course *</label>
                <select
                  required
                  value={newStudent.courseId}
                  onChange={(e) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                >
                  <option value="">Select Course</option>
                  {courses?.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
