/**
 * blog-post controller
 * Role-based access:
 * - Admin: full CRUD on all posts
 * - Content Manager: CRUD on own posts
 * - Student/Public: read published posts only
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('You do not have permission to create blog posts');
    }

    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: user.id,
    };

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    const { id } = ctx.params;

    if (role === 'Content-Manager') {
      const post = await strapi.documents('api::blog-post.blog-post').findOne({
        documentId: id,
        populate: ['author'],
      });
      if (!post || post.author?.id !== user.id) {
        return ctx.forbidden('You can only edit your own blog posts');
      }
    } else if (role !== 'Admin') {
      return ctx.forbidden('You do not have permission to edit blog posts');
    }

    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    const { id } = ctx.params;

    if (role === 'Content-Manager') {
      const post = await strapi.documents('api::blog-post.blog-post').findOne({
        documentId: id,
        populate: ['author'],
      });
      if (!post || post.author?.id !== user.id) {
        return ctx.forbidden('You can only delete your own blog posts');
      }
    } else if (role !== 'Admin') {
      return ctx.forbidden('You do not have permission to delete blog posts');
    }

    const response = await super.delete(ctx);
    return response;
  },

  // Public access: only published posts
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.role?.name;

    // Non-admin/CM users only see published posts
    if (!user || (role !== 'Admin' && role !== 'Content-Manager')) {
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
