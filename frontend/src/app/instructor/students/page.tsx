'use client';

import { useEffect, useState } from 'react';
import { lmsAPI } from '@/lib/api';

export default function InstructorStudentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await lmsAPI.getEnrolledStudents();
        setData(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading students...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Students</h1>

      <div className="space-y-6">
        {data.map((item: any) => (
          <div
            key={item.course?.documentId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold mb-4">{item.course?.title}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {item.totalEnrollments} students enrolled
            </p>
            {item.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {item.students.map((student: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {student.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.username}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No students enrolled yet.</p>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-gray-500 text-center py-8">No courses with enrolled students.</p>
      )}
    </div>
  );
}
