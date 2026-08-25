'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { lmsAPI } from '@/lib/api';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await lmsAPI.getMyCourses();
        setCourses(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch my courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading your courses...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div
            key={course.documentId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            {course.coverImage && (
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </p>
              </div>

              <Link
                href={`/student/courses/${course.documentId}`}
                className="block text-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
              </Link>
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
          <Link
            href="/student/courses"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Browse available courses →
          </Link>
        </div>
      )}
    </div>
  );
}
