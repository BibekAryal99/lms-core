/**
 * Custom LMS routes
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/lms/progress/:courseDocumentId',
      handler: 'lms.getCourseProgress',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lms/my-courses',
      handler: 'lms.getMyCourses',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lms/enrolled-students',
      handler: 'lms.getEnrolledStudents',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lms/stats',
      handler: 'lms.getStats',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
