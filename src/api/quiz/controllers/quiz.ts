/**
 * quiz controller
 * Role-based access:
 * - Admin: full CRUD
 * - Content Manager: full CRUD
 * - Instructor: CRUD on quizzes in their own courses
 * - Student: read-only
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin' && role !== 'Content-Manager' && role !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create quizzes');
    }

    if (role === 'Instructor') {
      const courseDocumentId = ctx.request.body.data?.course;
      if (courseDocumentId) {
        const course = await strapi.documents('api::course.course').findOne({
          documentId: courseDocumentId,
          populate: ['author'],
        });
        if (!course || course.author?.id !== user.id) {
          return ctx.forbidden('You can only add quizzes to your own courses');
        }
      }
    }

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    const { id } = ctx.params;

    if (role === 'Instructor') {
      const quiz = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: ['course', 'course.author'],
      });
      if (!quiz || quiz.course?.author?.id !== user.id) {
        return ctx.forbidden('You can only edit quizzes in your own courses');
      }
    } else if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to edit quizzes');
    }

    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    const { id } = ctx.params;

    if (role === 'Instructor') {
      const quiz = await strapi.documents('api::quiz.quiz').findOne({
        documentId: id,
        populate: ['course', 'course.author'],
      });
      if (!quiz || quiz.course?.author?.id !== user.id) {
        return ctx.forbidden('You can only delete quizzes in your own courses');
      }
    } else if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to delete quizzes');
    }

    const response = await super.delete(ctx);
    return response;
  },
}));
