'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesAPI, lessonsAPI, quizzesAPI, quizQuestionsAPI } from '@/lib/api';
import { lmsAPI } from '@/lib/api';
import Link from 'next/link';

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', videoUrl: '', order: 0 });
  const [creatingLesson, setCreatingLesson] = useState(false);

  // Quiz form
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '' });
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  useEffect(() => {
    fetchData();
  }, [documentId]);

  const fetchData = async () => {
    try {
      const courseRes = await coursesAPI.getOne(documentId);
      setCourse(courseRes.data.data);

      const lessonsRes = await lessonsAPI.getAll({
        filters: { course: { documentId } },
        sort: 'order:asc',
      });
      setLessons(lessonsRes.data.data || []);

      const quizzesRes = await quizzesAPI.getAll({
        filters: { course: { documentId } },
        populate: ['questions'],
      });
      setQuizzes(quizzesRes.data.data || []);

      const studentsRes = await lmsAPI.getEnrolledStudents();
      const courseStudents = studentsRes.data.data?.find(
        (s: any) => s.course?.documentId === documentId
      );
      setEnrolledStudents(courseStudents?.students || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLesson(true);
    try {
      await lessonsAPI.create({ ...newLesson, course: documentId });
      setNewLesson({ title: '', content: '', videoUrl: '', order: lessons.length + 1 });
      setShowLessonForm(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create lesson');
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonDocumentId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await lessonsAPI.delete(lessonDocumentId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete lesson');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingQuiz(true);
    try {
      const quizRes = await quizzesAPI.create({ ...newQuiz, course: documentId });
      const quizDocumentId = quizRes.data.data.documentId;

      // Create questions
      for (const q of quizQuestions) {
        await quizQuestionsAPI.create({ ...q, quiz: quizDocumentId });
      }

      setNewQuiz({ title: '' });
      setQuizQuestions([]);
      setShowQuizForm(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create quiz');
    } finally {
      setCreatingQuiz(false);
    }
  };

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { question: '', options: ['', '', '', ''], correctAnswer: 0 },
    ]);
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const updated = [...quizQuestions];
    if (field === 'options') {
      updated[index].options = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setQuizQuestions(updated);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-8 text-gray-500">Course not found.</div>;
  }

  return (
    <div>
      <Link href="/instructor/courses" className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block">
        ← Back to My Courses
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
          <span>{lessons.length} lessons</span>
          <span>{quizzes.length} quizzes</span>
          <span>{enrolledStudents.length} enrolled students</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lessons Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Lessons</h2>
            <button
              onClick={() => setShowLessonForm(!showLessonForm)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              {showLessonForm ? 'Cancel' : '+ Add Lesson'}
            </button>
          </div>

          {showLessonForm && (
            <form onSubmit={handleCreateLesson} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Lesson title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <textarea
                placeholder="Lesson content"
                value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
              <input
                type="text"
                placeholder="Video URL (optional)"
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Order"
                value={newLesson.order}
                onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) || 0 })}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={creatingLesson}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {creatingLesson ? 'Creating...' : 'Create Lesson'}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.documentId}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm text-gray-500 mr-2">#{lesson.order}</span>
                  <span className="font-medium">{lesson.title}</span>
                </div>
                <button
                  onClick={() => handleDeleteLesson(lesson.documentId)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quizzes</h2>
            <button
              onClick={() => setShowQuizForm(!showQuizForm)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              {showQuizForm ? 'Cancel' : '+ Add Quiz'}
            </button>
          </div>

          {showQuizForm && (
            <form onSubmit={handleCreateQuiz} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Quiz title"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />

              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                  <input
                    type="text"
                    placeholder={`Question ${qIndex + 1}`}
                    value={q.question}
                    onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                  {q.options.map((opt: string, oIndex: number) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[oIndex] = e.target.value;
                          updateQuizQuestion(qIndex, 'options', newOpts);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Select the correct answer with the radio button</p>
                </div>
              ))}

              <button
                type="button"
                onClick={addQuizQuestion}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                + Add Question
              </button>

              <button
                type="submit"
                disabled={creatingQuiz || quizQuestions.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {creatingQuiz ? 'Creating...' : 'Create Quiz'}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.documentId}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{quiz.title}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({quiz.questions?.length || 0} questions)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrolled Students */}
      {enrolledStudents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student: any, index: number) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-sm">{student.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
