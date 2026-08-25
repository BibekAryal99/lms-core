/**
 * quiz-result controller
 * Role-based access:
 * - Student: submit quizzes (auto-graded), view own results
 * - Instructor: view results for own courses
 * - Admin: view all results
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  // Student submits quiz answers - auto-graded
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Student') {
      return ctx.forbidden('Only students can submit quizzes');
    }

    const { quiz: quizDocumentId, answers } = ctx.request.body.data || {};
    if (!quizDocumentId || !answers) {
      return ctx.badRequest('Quiz ID and answers are required');
    }

    // Fetch quiz with questions
    const quiz = await strapi.documents('api::quiz.quiz').findOne({
      documentId: quizDocumentId,
      populate: ['questions', 'course'],
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found');
    }

    // Check enrollment
    if (quiz.course) {
      const enrollment = await strapi.documents('api::enrollment.enrollment').findMany({
        filters: {
          user: { id: user.id },
          course: { documentId: quiz.course.documentId },
        },
      });

      if (enrollment.length === 0) {
        return ctx.forbidden('You must be enrolled in this course to take the quiz');
      }
    }

    // Auto-grade: compare answers with correct answers
    const questions = quiz.questions || [];
    let score = 0;
    const totalQuestions = questions.length;

    for (const question of questions) {
      const userAnswer = answers[question.documentId] || answers[question.id];
      if (userAnswer === question.correctAnswer) {
        score++;
      }
    }

    // Save result
    ctx.request.body.data = {
      user: user.id,
      quiz: quizDocumentId,
      answers,
      score,
      totalQuestions,
    };

    const response = await super.create(ctx);
    return {
      data: {
        ...response.data,
        score,
        totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
      },
    };
  },

  // Find results filtered by role
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;

    if (role === 'Student') {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          user: { id: user.id },
        },
      };
    } else if (role === 'Instructor') {
      const myCourses = await strapi.documents('api::course.course').findMany({
        filters: { author: { id: user.id } },
      });
      const courseIds = myCourses.map((c) => c.documentId);

      const myQuizzes = await strapi.documents('api::quiz.quiz').findMany({
        filters: { course: { documentId: { $in: courseIds } } },
      });
      const quizIds = myQuizzes.map((q) => q.documentId);

      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          quiz: { documentId: { $in: quizIds } },
        },
      };
    }

    const response = await super.find(ctx);
    return response;
  },
}));
