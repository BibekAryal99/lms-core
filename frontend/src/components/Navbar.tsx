'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isRole } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-indigo-600">📚 LMS</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                {/* Student links */}
                {isRole('student') && (
                  <>
                    <Link href="/student/courses" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Browse Courses
                    </Link>
                    <Link href="/student/my-courses" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      My Courses
                    </Link>
                  </>
                )}

                {/* Instructor links */}
                {isRole('instructor') && (
                  <>
                    <Link href="/instructor/courses" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      My Courses
                    </Link>
                    <Link href="/instructor/students" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Students
                    </Link>
                  </>
                )}

                {/* Content Manager links */}
                {isRole('content-manager') && (
                  <>
                    <Link href="/content/courses" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Courses
                    </Link>
                    <Link href="/content/blog" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Blog
                    </Link>
                  </>
                )}

                {/* Admin links */}
                {isRole('admin-role') && (
                  <>
                    <Link href="/admin" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link href="/admin/users" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Users
                    </Link>
                    <Link href="/admin/courses" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Courses
                    </Link>
                    <Link href="/admin/blog" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                      Blog
                    </Link>
                  </>
                )}

                {/* Public links */}
                <Link href="/blog" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Blog
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.username}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                    {user.role?.name || 'User'}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
