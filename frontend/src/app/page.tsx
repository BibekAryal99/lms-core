'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { coursesAPI, blogAPI } from '@/lib/api';

export default function HomePage() {
  const { user, isRole } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await coursesAPI.getAll({
          filters: { publishedAt: { $notNull: true } },
          populate: ['author'],
          sort: 'createdAt:desc',
          pagination: { pageSize: 6 },
        });
        setCourses(coursesRes.data.data || []);

        const blogRes = await blogAPI.getAll({
          filters: { publishedAt: { $notNull: true } },
          populate: ['author'],
          sort: 'createdAt:desc',
          pagination: { pageSize: 3 },
        });
        setBlogPosts(blogRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (user) {
      if (isRole('admin-role')) window.location.href = '/admin';
      else if (isRole('content-manager')) window.location.href = '/content/courses';
      else if (isRole('instructor')) window.location.href = '/instructor/courses';
      else if (isRole('student')) window.location.href = '/student/courses';
    }
  }, [user, isRole]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-6">Learn Without Limits</h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl">
            Explore courses, track your progress, and achieve your learning goals with our comprehensive LMS platform.
          </p>
          {!user && (
            <div className="flex space-x-4">
              <Link
                href="/register"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Featured Courses */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    By {course.author?.username || 'Unknown'}
                  </span>
                  {user && isRole('student') && (
                    <Link
                      href={`/student/courses/${course.documentId}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Course →
                    </Link>
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

      {/* Blog Preview */}
      {blogPosts.length > 0 && (
        <div className="bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold mb-8">Latest from the Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div
                  key={post.documentId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{post.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
