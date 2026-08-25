'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesAPI, progressAPI, quizzesAPI, quizResultsAPI } from '@/lib/api';
import { lmsAPI } from '@/lib/api';
import Link from 'next/link';

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await coursesAPI.getOne(documentId);
        setCourse(courseRes.data.data);

        const progressRes = await lmsAPI.getCourseProgress(documentId);
        setProgress(progressRes.data.data);

        // Fetch quizzes for this course
        const quizzesRes = await quizzesAPI.getAll({
          filters: { course: { documentId } },
          populate: ['questions'],
        });
        setQuizzes(quizzesRes.data.data || []);

        // Fetch quiz results
        const resultsRes = await quizResultsAPI.getAll({
          filters: { quiz: { course: { documentId } } },
          populate: ['quiz'],
        });
        setQuizResults(resultsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [documentId]);

  const handleMarkComplete = async (lessonDocumentId: string) => {
    setMarkingComplete(lessonDocumentId);
    try {
      await progressAPI.markComplete(lessonDocumentId);
      // Refresh progress
      const progressRes = await lmsAPI.getCourseProgress(documentId);
      setProgress(progressRes.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to mark as complete');
    } finally {
      setMarkingComplete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-8 text-gray-500">Course not found.</div>;
  }

  const lessons = course.lessons || [];
  const lessonProgress = progress?.lessons || [];

  return (
    <div>
      <Link href="/student/my-courses" className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block">
        ← Back to My Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>

        {/* Progress Bar */}
        {progress && (
          <div className="max-w-md">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Course Progress</span>
              <span className="font-semibold">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {progress.completed} of {progress.total} lessons completed
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lessons List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          <div className="space-y-2">
            {lessons
              .sort((a: any, b: any) => a.order - b.order)
              .map((lesson: any) => {
                const isCompleted = lessonProgress.some(
                  (p: any) => p.lesson?.documentId === lesson.documentId && p.completed
                );
                const isActive = activeLesson?.documentId === lesson.documentId;

                return (
                  <button
                    key={lesson.documentId}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : lesson.order}
                        </span>
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-2">
          {activeLesson ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4">{activeLesson.title}</h2>

              {activeLesson.videoUrl && (
                <div className="mb-6">
                  <iframe
                    src={activeLesson.videoUrl}
                    className="w-full aspect-video rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{activeLesson.content}</p>
              </div>

              {/* Mark Complete Button */}
              {(() => {
                const isCompleted = lessonProgress.some(
                  (p: any) => p.lesson?.documentId === activeLesson.documentId && p.completed
                );
                return isCompleted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    ✅ This lesson is completed
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkComplete(activeLesson.documentId)}
                    disabled={markingComplete === activeLesson.documentId}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {markingComplete === activeLesson.documentId ? 'Marking...' : 'Mark as Complete'}
                  </button>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
              Select a lesson to start learning
            </div>
          )}

          {/* Quizzes Section */}
          {quizzes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Quizzes</h2>
              <div className="space-y-4">
                {quizzes.map((quiz: any) => {
                  const result = quizResults.find((r: any) => r.quiz?.documentId === quiz.documentId);
                  return (
                    <div
                      key={quiz.documentId}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-gray-500">
                            {quiz.questions?.length || 0} questions
                          </p>
                        </div>
                        <div>
                          {result ? (
                            <div className="text-right">
                              <span className="text-lg font-bold text-indigo-600">
                                {result.score}/{result.totalQuestions}
                              </span>
                              <p className="text-xs text-gray-500">
                                {Math.round((result.score / result.totalQuestions) * 100)}%
                              </p>
                            </div>
                          ) : (
                            <Link
                              href={`/student/courses/${documentId}/quiz/${quiz.documentId}`}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                            >
                              Take Quiz
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
