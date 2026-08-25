/**
 * course controller
 * Role-based access:
 * - Admin: full CRUD
 * - Content Manager: full CRUD
 * - Instructor: CRUD on own courses only
 * - Student: read-only
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  // Override create to set author automatically
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin' && role !== 'Content-Manager' && role !== 'Instructor') {
      return ctx.forbidden('You do not have permission to create courses');
    }

    // Set author to current user
    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  // Override update to check ownership for instructors
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    const { id } = ctx.params;

    if (role === 'Instructor') {
      // Check if course belongs to this instructor
      const course = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['author'],
      });
      if (!course || course.author?.id !== user.id) {
        return ctx.forbidden('You can only edit your own courses');
      }
    } else if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to edit courses');
    }

    const response = await super.update(ctx);
    return response;
  },

  // Override delete to check ownership for instructors
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    const { id } = ctx.params;

    if (role === 'Instructor') {
      const course = await strapi.documents('api::course.course').findOne({
        documentId: id,
        populate: ['author'],
      });
      if (!course || course.author?.id !== user.id) {
        return ctx.forbidden('You can only delete your own courses');
      }
    } else if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to delete courses');
    }

    const response = await super.delete(ctx);
    return response;
  },

  // Override find to filter by role
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.role?.name;

    // Students see only published courses
    if (!user || role === 'Student') {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          publishedAt: { $notNull: true },
        },
      };
    }

    const response = await super.find(ctx);
    return response;
  },
}));
