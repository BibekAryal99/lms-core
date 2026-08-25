'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isRole('instructor'))) {
      router.push('/login');
    }
  }, [user, loading, isRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user || !isRole('instructor')) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
