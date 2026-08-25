/**
 * lesson-progress controller
 * Role-based access:
 * - Student: mark lessons complete, view own progress
 * - Instructor: view progress for own courses
 * - Admin: view all progress
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson-progress.lesson-progress', ({ strapi }) => ({
  // Student marks a lesson as complete
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Student') {
      return ctx.forbidden('Only students can track lesson progress');
    }

    const lessonDocumentId = ctx.request.body.data?.lesson;
    if (!lessonDocumentId) {
      return ctx.badRequest('Lesson ID is required');
    }

    // Check if student is enrolled in the course containing this lesson
    const lesson = await strapi.documents('api::lesson.lesson').findOne({
      documentId: lessonDocumentId,
      populate: ['course'],
    });

    if (!lesson || !lesson.course) {
      return ctx.badRequest('Lesson not found or has no associated course');
    }

    const enrollment = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        user: { id: user.id },
        course: { documentId: lesson.course.documentId },
      },
    });

    if (enrollment.length === 0) {
      return ctx.forbidden('You must be enrolled in this course to track progress');
    }

    // Check if progress already exists
    const existingProgress = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
      filters: {
        user: { id: user.id },
        lesson: { documentId: lessonDocumentId },
      },
    });

    if (existingProgress.length > 0) {
      // Update existing progress
      const response = await strapi.documents('api::lesson-progress.lesson-progress').update({
        documentId: existingProgress[0].documentId,
        data: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      });
      return { data: response };
    }

    // Create new progress entry
    ctx.request.body.data = {
      user: user.id,
      lesson: lessonDocumentId,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    const response = await super.create(ctx);
    return response;
  },

  // Find progress filtered by role
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
      // Instructors see progress for lessons in their courses
      const myCourses = await strapi.documents('api::course.course').findMany({
        filters: { author: { id: user.id } },
      });
      const courseIds = myCourses.map((c) => c.documentId);

      const myLessons = await strapi.documents('api::lesson.lesson').findMany({
        filters: { course: { documentId: { $in: courseIds } } },
      });
      const lessonIds = myLessons.map((l) => l.documentId);

      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          lesson: { documentId: { $in: lessonIds } },
        },
      };
    }
    // Admin sees all

    const response = await super.find(ctx);
    return response;
  },
}));
