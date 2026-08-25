'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI, enrollmentsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await coursesAPI.getAll({
          filters: { publishedAt: { $notNull: true } },
          populate: ['author'],
          sort: 'createdAt:desc',
        });
        setCourses(coursesRes.data.data || []);

        if (user) {
          const enrollRes = await enrollmentsAPI.getAll({
            populate: ['course'],
          });
          const ids = new Set(
            (enrollRes.data.data || []).map((e: any) => e.course?.documentId)
          );
          setEnrolledIds(ids);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (courseDocumentId: string) => {
    setEnrolling(courseDocumentId);
    try {
      await enrollmentsAPI.create({ course: courseDocumentId });
      setEnrolledIds((prev) => new Set([...prev, courseDocumentId]));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading courses...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Browse Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
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
              <p className="text-sm text-gray-500 mb-4">
                By {course.author?.username || 'Unknown'}
              </p>
              <div className="flex items-center justify-between">
                {enrolledIds.has(course.documentId) ? (
                  <Link
                    href={`/student/courses/${course.documentId}`}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200"
                  >
                    Continue Learning →
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.documentId)}
                    disabled={enrolling === course.documentId}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {enrolling === courseDocumentId ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-gray-500 text-center py-8">No courses available yet.</p>
      )}
    </div>
  );
}
