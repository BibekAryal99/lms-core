'use client';

import { useEffect, useState } from 'react';
import { lmsAPI } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await lmsAPI.getStats();
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalCourses || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Enrollments</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalEnrollments || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Blog Posts</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.totalBlogPosts || 0}</p>
        </div>
      </div>

      {/* Users by Role */}
      {stats?.usersByRole && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                <p className="text-sm text-gray-600">{role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold mb-2">👥 Manage Users</h3>
          <p className="text-sm text-gray-600">View and manage user roles</p>
        </Link>
        <Link
          href="/admin/courses"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold mb-2">📚 Manage Courses</h3>
          <p className="text-sm text-gray-600">View and manage all courses</p>
        </Link>
        <Link
          href="/admin/blog"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold mb-2">✍️ Manage Blog</h3>
          <p className="text-sm text-gray-600">Write and manage blog posts</p>
        </Link>
      </div>
    </div>
  );
}
