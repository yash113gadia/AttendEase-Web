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
      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5 animate-pulse">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg mb-4" />
              <div className="h-4 bg-zinc-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-50 rounded w-1/2" />
            </div>
          ))
        ) : courses?.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-zinc-200 py-16 text-center">
            <GraduationCap className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="font-medium text-zinc-900">No courses found</p>
            <p className="text-sm text-zinc-500 mt-1">Courses will appear here once added</p>
          </div>
        ) : (
          courses?.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                  {course.code}
                </span>
              </div>
              <h3 className="font-medium text-zinc-900 mb-1">{course.name}</h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                {course.description || 'No description available'}
              </p>
              <div className="pt-3 border-t border-zinc-100">
                <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>{course.student_count || 0} students</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
