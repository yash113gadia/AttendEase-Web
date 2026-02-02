import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { BookOpen, Users, GraduationCap } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  student_count: number;
}

const courseColors = [
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-purple-500 to-purple-600',
  'from-cyan-500 to-cyan-600',
];

export default function Courses() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/courses');
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500">View all available courses</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-xl mb-5\" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))
        ) : courses?.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <GraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-500">Courses will appear here once added.</p>
          </div>
        ) : (
          courses?.map((course, idx) => (
            <div 
              key={course.id} 
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 card-hover group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${courseColors[idx % courseColors.length]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                  {course.code}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                {course.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {course.description || 'No description available'}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{course.student_count || 0} Students</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
