'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizzesAPI, quizResultsAPI } from '@/lib/api';
import Link from 'next/link';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizzesAPI.getOne(quizId);
        setQuiz(res.data.data);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (questionDocumentId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionDocumentId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    // Check all questions answered
    const questions = quiz?.questions || [];
    const unanswered = questions.filter((q: any) => answers[q.documentId] === undefined);

    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await quizResultsAPI.submit(quizId, answers);
      setResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8 text-gray-500">Quiz not found.</div>;
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/student/courses/${documentId}`}
          className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block"
        >
          ← Back to Course
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">
            {result.percentage >= 70 ? '🎉' : '📚'}
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 mb-6">{quiz.title}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <p className="text-xl text-gray-600">
              {result.percentage}% correct
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Link
              href={`/student/courses/${documentId}`}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/student/courses/${documentId}`}
        className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-block"
      >
        ← Back to Course
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{questions.length} questions</p>
      </div>

      <div className="space-y-6">
        {questions.map((question: any, index: number) => (
          <div
            key={question.documentId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              <span className="text-indigo-600">Q{index + 1}.</span> {question.question}
            </h3>
            <div className="space-y-3">
              {question.options?.map((option: string, optIndex: number) => (
                <label
                  key={optIndex}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                    answers[question.documentId] === optIndex
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.documentId}
                    checked={answers[question.documentId] === optIndex}
                    onChange={() => handleAnswer(question.documentId, optIndex)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}
