'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({
        populate: ['author', 'lessons', 'enrollments'],
        sort: 'createdAt:desc',
      });
      // Filter to only show instructor's courses
      const myCourses = (res.data.data || []).filter(
        (c: any) => c.author?.documentId === user?.documentId
      );
      setCourses(myCourses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await coursesAPI.create(newCourse);
      setNewCourse({ title: '', description: '' });
      setShowCreate(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create course');
    } finally {
      setCreating(false);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showCreate ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {/* Create Course Form */}
      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.documentId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span>{course.lessons?.length || 0} lessons</span>
              <span>{course.enrollments?.length || 0} students</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                course.publishedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {course.publishedAt ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/instructor/courses/${course.documentId}`}
                className="flex-1 text-center bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Manage
              </Link>
              <button
                onClick={() => handleDelete(course.documentId)}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-gray-500 text-center py-8">No courses yet. Create your first course!</p>
      )}
    </div>
  );
}
