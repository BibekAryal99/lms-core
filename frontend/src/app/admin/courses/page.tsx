'use client';

import { useEffect, useState } from 'react';
import { adminAPI, coursesAPI } from '@/lib/api';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await adminAPI.getAllCourses();
      setCourses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await coursesAPI.delete(documentId);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading courses...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Course</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Author</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Lessons</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Students</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.documentId} className="border-t border-gray-200">
                <td className="px-6 py-4 font-medium">{course.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.author}</td>
                <td className="px-6 py-4 text-sm">{course.lessonCount}</td>
                <td className="px-6 py-4 text-sm">{course.enrollmentCount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(course.documentId)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
