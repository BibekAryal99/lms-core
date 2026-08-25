/**
 * Admin controller
 * Manages user roles and platform stats
 */
import type { Core } from '@strapi/strapi';

export default {
  /**
   * GET /api/admin/users
   * Admin can view all users
   */
  async getUsers(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin') {
      return ctx.forbidden('Only admins can manage users');
    }

    const users = await strapi.documents('plugin::users-permissions.user').findMany({
      populate: ['role'],
    });

    // Strip sensitive fields
    const sanitized = users.map((u: any) => ({
      id: u.id,
      documentId: u.documentId,
      username: u.username,
      email: u.email,
      confirmed: u.confirmed,
      blocked: u.blocked,
      role: u.role?.name || 'Unknown',
      createdAt: u.createdAt,
    }));

    return { data: sanitized };
  },

  /**
   * PUT /api/admin/users/:userId/role
   * Admin can change a user's role
   */
  async updateUserRole(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin') {
      return ctx.forbidden('Only admins can change user roles');
    }

    const { userId } = ctx.params;
    const { roleName } = ctx.request.body;

    if (!roleName) {
      return ctx.badRequest('Role name is required');
    }

    const validRoles = ['student', 'instructor', 'content-manager', 'admin-role'];
    if (!validRoles.includes(roleName)) {
      return ctx.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Find the role by type
    const roleService = strapi.plugin('users-permissions').service('role');
    const targetRole = await roleService.findOne(roleName);

    if (!targetRole) {
      return ctx.notFound('Role not found');
    }

    // Update user role
    const userService = strapi.plugin('users-permissions').service('user');
    await userService.editUser({ id: userId }, { role: targetRole.id });

    return { data: { message: `User role updated to ${roleName}` } };
  },

  /**
   * GET /api/admin/courses
   * Admin can view all courses with details
   */
  async getAllCourses(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('Not authorized');
    }

    const courses = await strapi.documents('api::course.course').findMany({
      populate: ['author', 'lessons', 'enrollments'],
    });

    return {
      data: courses.map((c: any) => ({
        documentId: c.documentId,
        title: c.title,
        description: c.description,
        author: c.author?.username || 'Unknown',
        lessonCount: c.lessons?.length || 0,
        enrollmentCount: c.enrollments?.length || 0,
        published: !!c.publishedAt,
        createdAt: c.createdAt,
      })),
    };
  },
};
