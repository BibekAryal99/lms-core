/**
 * Admin routes
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/admin/users',
      handler: 'admin.getUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/admin/users/:userId/role',
      handler: 'admin.updateUserRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/admin/courses',
      handler: 'admin.getAllCourses',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
