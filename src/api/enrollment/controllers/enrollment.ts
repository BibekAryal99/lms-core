/**
 * enrollment controller
 * Role-based access:
 * - Student: can enroll in courses, view own enrollments
 * - Instructor: view enrollments for own courses
 * - Admin/Content Manager: view all enrollments
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  // Student enrolls in a course
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Student') {
      return ctx.forbidden('Only students can enroll in courses');
    }

    const courseDocumentId = ctx.request.body.data?.course;
    if (!courseDocumentId) {
      return ctx.badRequest('Course ID is required');
    }

    // Check if already enrolled
    const existingEnrollment = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        user: { id: user.id },
        course: { documentId: courseDocumentId },
      },
    });

    if (existingEnrollment.length > 0) {
      return ctx.badRequest('You are already enrolled in this course');
    }

    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  // Find enrollments filtered by role
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;

    if (role === 'Student') {
      // Students only see their own enrollments
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          user: { id: user.id },
        },
      };
    } else if (role === 'Instructor') {
      // Instructors see enrollments for their courses
      const myCourses = await strapi.documents('api::course.course').findMany({
        filters: { author: { id: user.id } },
      });
      const courseIds = myCourses.map((c) => c.documentId);
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          course: { documentId: { $in: courseIds } },
        },
      };
    }
    // Admin and Content Manager see all

    const response = await super.find(ctx);
    return response;
  },
}));
