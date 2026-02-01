import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, BookOpen, Users, MoreVertical } from 'lucide-react';

interface Course {
  id: number;
  courseName: string;
  description: string;
}

export default function Courses() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500">Manage courses and classes</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-5 h-5" />
          Add Course
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading courses...
          </div>
        ) : courses?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No courses found. Create your first course!
          </div>
        ) : (
          courses?.map(course => (
            <div key={course.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{course.courseName}</h3>
              <p className="text-sm text-gray-500 mb-4">{course.description || 'No description'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  45 Students
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
