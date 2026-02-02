import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Search, Trash2, Upload, Download, X } from 'lucide-react';
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
      const dataLines = header.includes('roll') || header.includes('name') ? lines.slice(1) : lines;
      
      const studentsData = dataLines.map(line => {
        const [rollNumber, name, email] = line.split(',').map(s => s.trim());
        return { rollNumber, name, email: email || '', courseId: parseInt(selectedCourse) || 1 };
      }).filter(s => s.rollNumber && s.name);

      if (studentsData.length > 0) importMutation.mutate(studentsData);
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

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 75) return 'bg-emerald-50 text-emerald-700';
    if (percentage >= 50) return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-zinc-500">{students?.length || 0} students enrolled</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[180px]"
        >
          <option value="all">All Courses</option>
          {courses?.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Roll No.</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Course</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Attendance</th>
                {isAdmin && <th className="w-12"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded w-16 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded w-28 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded w-16 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded w-32 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-zinc-100 rounded w-12 animate-pulse" /></td>
                  </tr>
                ))
              ) : students?.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-zinc-500 text-sm">
                    No students found
                  </td>
                </tr>
              ) : (
                students?.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <code className="text-sm text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">{student.roll_number}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-medium text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                        {student.course_code || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{student.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${getAttendanceBadge(student.attendance_percentage || 0)}`}>
                        {student.attendance_percentage || 0}%
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { if (confirm(`Delete ${student.name}?`)) deleteMutation.mutate(student.id); }}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md"
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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl animate-in">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900">Add Student</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(newStudent); }} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Roll Number</label>
                <input
                  type="text"
                  required
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Course</label>
                <select
                  required
                  value={newStudent.courseId}
                  onChange={(e) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select course</option>
                  {courses?.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
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
