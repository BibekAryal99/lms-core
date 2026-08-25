/**
 * Custom LMS controller
 * Provides specialized endpoints for:
 * - Course progress calculation
 * - Enrollment management
 * - Quiz submission with auto-grading
 */
import type { Core } from '@strapi/strapi';

export default {
  /**
   * GET /api/lms/progress/:courseDocumentId
   * Returns progress percentage for the current student in a course
   */
  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const { courseDocumentId } = ctx.params;

    // Get all lessons in the course
    const lessons = await strapi.documents('api::lesson.lesson').findMany({
      filters: { course: { documentId: courseDocumentId } },
    });

    const totalLessons = lessons.length;
    if (totalLessons === 0) {
      return { data: { percentage: 0, completed: 0, total: 0, lessons: [] } };
    }

    const lessonDocumentIds = lessons.map((l) => l.documentId);

    // Get completed lessons for this student
    const completedProgress = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
      filters: {
        user: { id: user.id },
        lesson: { documentId: { $in: lessonDocumentIds } },
        completed: true,
      },
      populate: ['lesson'],
    });

    const completedCount = completedProgress.length;
    const percentage = Math.round((completedCount / totalLessons) * 100);

    return {
      data: {
        percentage,
        completed: completedCount,
        total: totalLessons,
        lessons: lessons.map((lesson) => ({
          documentId: lesson.documentId,
          title: lesson.title,
          order: lesson.order,
          completed: completedProgress.some(
            (p) => p.lesson?.documentId === lesson.documentId
          ),
        })),
      },
    };
  },

  /**
   * GET /api/lms/my-courses
   * Returns courses the current student is enrolled in with progress
   */
  async getMyCourses(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const enrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: { user: { id: user.id } },
      populate: ['course', 'course.lessons'],
    });

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        if (!course) return null;

        const lessons = course.lessons || [];
        const totalLessons = lessons.length;

        const completedProgress = await strapi.documents('api::lesson-progress.lesson-progress').findMany({
          filters: {
            user: { id: user.id },
            lesson: { documentId: { $in: lessons.map((l) => l.documentId) } },
            completed: true,
          },
        });

        return {
          documentId: course.documentId,
          title: course.title,
          description: course.description,
          coverImage: course.coverImage,
          progress: totalLessons > 0
            ? Math.round((completedProgress.length / totalLessons) * 100)
            : 0,
          completedLessons: completedProgress.length,
          totalLessons,
        };
      })
    );

    return { data: coursesWithProgress.filter(Boolean) };
  },

  /**
   * GET /api/lms/enrolled-courses
   * Returns courses the instructor's students are enrolled in with progress stats
   */
  async getEnrolledStudents(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Instructor' && role !== 'Admin' && role !== 'Content-Manager') {
      return ctx.forbidden('Not authorized');
    }

    // Get instructor's courses
    const courses = await strapi.documents('api::course.course').findMany({
      filters: role === 'Instructor' ? { author: { id: user.id } } : {},
      populate: ['lessons', 'enrollments', 'enrollments.user'],
    });

    const result = courses.map((course) => ({
      course: {
        documentId: course.documentId,
        title: course.title,
      },
      totalEnrollments: course.enrollments?.length || 0,
      students: (course.enrollments || []).map((e: any) => ({
        userId: e.user?.id,
        username: e.user?.username,
        email: e.user?.email,
      })),
    }));

    return { data: result };
  },

  /**
   * GET /api/lms/stats
   * Returns platform statistics (admin only)
   */
  async getStats(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const role = user.role?.name;
    if (role !== 'Admin') {
      return ctx.forbidden('Only admins can view platform stats');
    }

    const totalUsers = await strapi.documents('plugin::users-permissions.user').findMany({});
    const totalCourses = await strapi.documents('api::course.course').findMany({});
    const totalEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({});
    const totalBlogPosts = await strapi.documents('api::blog-post.blog-post').findMany({});
    const totalQuizzes = await strapi.documents('api::quiz.quiz').findMany({});

    // Count users by role
    const roleCounts: Record<string, number> = {};
    for (const u of totalUsers) {
      const roleName = u.role?.name || 'Unknown';
      roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
    }

    return {
      data: {
        totalUsers: totalUsers.length,
        usersByRole: roleCounts,
        totalCourses: totalCourses.length,
        totalEnrollments: totalEnrollments.length,
        totalBlogPosts: totalBlogPosts.length,
        totalQuizzes: totalQuizzes.length,
      },
    };
  },
};
