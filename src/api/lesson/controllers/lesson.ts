/**
 * lesson controller
 * Role-based access:
 * - Admin: full CRUD
 * - Content Manager: full CRUD
 * - Instructor: CRUD on lessons in their own courses
 * - Student: read-only for enrolled courses
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin' && role !== 'Content-Manager' && role !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create lessons');
    }

    // If instructor, verify course ownership
    if (role === 'Instructor') {
      const courseDocumentId = ctx.request.body.data?.course;
      if (courseDocumentId) {
        const course = await strapi.documents('api::course.course').findOne({
          documentId: courseDocumentId,
          populate: ['author'],
        });
        if (!course || course.author?.id !== user.id) {
          return ctx.forbidden('You can only add lessons to your own courses');
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
      const lesson = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: ['course', 'course.author'],
      });
      if (!lesson || lesson.course?.author?.id !== user.id) {
        return ctx.forbidden('You can only edit lessons in your own courses');
      }
    } else if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to edit lessons');
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
      const lesson = await strapi.documents('api::lesson.lesson').findOne({
        documentId: id,
        populate: ['course', 'course.author'],
      });
      if (!lesson || lesson.course?.author?.id !== user.id) {
        return ctx.forbidden('You can only delete lessons in your own courses');
      }
    } else if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to delete lessons');
    }

    const response = await super.delete(ctx);
    return response;
  },
}));
