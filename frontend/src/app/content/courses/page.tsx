'use client';

import { useEffect, useState } from 'react';
import { coursesAPI, lessonsAPI, quizzesAPI, quizQuestionsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function ContentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Selected course for managing
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', videoUrl: '', order: 0 });

  // Quiz form
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '' });
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll({
        populate: ['author', 'lessons', 'enrollments'],
        sort: 'createdAt:desc',
      });
      setCourses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (documentId: string) => {
    try {
      const courseRes = await coursesAPI.getOne(documentId);
      setSelectedCourse(courseRes.data.data);

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
    } catch (err) {
      console.error('Failed to fetch course details:', err);
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

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lessonsAPI.create({ ...newLesson, course: selectedCourse.documentId });
      setNewLesson({ title: '', content: '', videoUrl: '', order: lessons.length + 1 });
      setShowLessonForm(false);
      fetchCourseDetails(selectedCourse.documentId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create lesson');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quizRes = await quizzesAPI.create({ ...newQuiz, course: selectedCourse.documentId });
      for (const q of quizQuestions) {
        await quizQuestionsAPI.create({ ...q, quiz: quizRes.data.data.documentId });
      }
      setNewQuiz({ title: '' });
      setQuizQuestions([]);
      setShowQuizForm(false);
      fetchCourseDetails(selectedCourse.documentId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create quiz');
    }
  };

  const handlePublish = async (documentId: string) => {
    try {
      await coursesAPI.update(documentId, { publishedAt: new Date().toISOString() });
      fetchCourses();
      if (selectedCourse?.documentId === documentId) {
        fetchCourseDetails(documentId);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to publish');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await coursesAPI.delete(documentId);
      if (selectedCourse?.documentId === documentId) setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { question: '', options: ['', '', '', ''], correctAnswer: 0 },
    ]);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading courses...</div>;
  }

  // If a course is selected, show its details
  if (selectedCourse) {
    return (
      <div>
        <button
          onClick={() => setSelectedCourse(null)}
          className="text-indigo-600 hover:text-indigo-700 text-sm mb-4"
        >
          ← Back to All Courses
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
              <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
            </div>
            <div className="flex space-x-2">
              {!selectedCourse.publishedAt && (
                <button
                  onClick={() => handlePublish(selectedCourse.documentId)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lessons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Lessons ({lessons.length})</h2>
              <button
                onClick={() => setShowLessonForm(!showLessonForm)}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                {showLessonForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showLessonForm && (
              <form onSubmit={handleCreateLesson} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
                <textarea
                  placeholder="Content"
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Video URL (optional)"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                  Create Lesson
                </button>
              </form>
            )}

            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div key={lesson.documentId} className="bg-white border rounded-lg p-3 flex justify-between">
                  <span className="text-sm"><span className="text-gray-500">#{lesson.order}</span> {lesson.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quizzes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quizzes ({quizzes.length})</h2>
              <button
                onClick={() => setShowQuizForm(!showQuizForm)}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                {showQuizForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showQuizForm && (
              <form onSubmit={handleCreateQuiz} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Quiz title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
                {quizQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-white p-3 rounded-lg border space-y-2">
                    <input
                      type="text"
                      placeholder={`Question ${qIndex + 1}`}
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...quizQuestions];
                        updated[qIndex].question = e.target.value;
                        setQuizQuestions(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      required
                    />
                    {q.options.map((opt: string, oIndex: number) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => {
                            const updated = [...quizQuestions];
                            updated[qIndex].correctAnswer = oIndex;
                            setQuizQuestions(updated);
                          }}
                        />
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIndex].options[oIndex] = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className="flex-1 px-3 py-1 border rounded-lg text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <button type="button" onClick={addQuizQuestion} className="text-indigo-600 text-sm">
                  + Add Question
                </button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                  Create Quiz
                </button>
              </form>
            )}

            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <div key={quiz.documentId} className="bg-white border rounded-lg p-3">
                  <span className="font-medium">{quiz.title}</span>
                  <span className="text-gray-500 text-sm ml-2">({quiz.questions?.length || 0} questions)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course list view
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showCreate ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border p-6 mb-8 space-y-4">
          <input
            type="text"
            placeholder="Course title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <textarea
            placeholder="Description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.documentId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => fetchCourseDetails(course.documentId)}
          >
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{course.lessonCount || 0} lessons</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                course.publishedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {course.publishedAt ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
