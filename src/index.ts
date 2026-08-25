import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Seed default roles if they don't exist
    await seedRoles(strapi);
  },
};

/**
 * Seeds the four required LMS roles into Strapi's users-permissions plugin.
 * Only creates roles that don't already exist.
 */
async function seedRoles(strapi: Core.Strapi) {
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });

  const roleService = strapi.plugin('users-permissions').service('role');

  // Check if roles already exist
  const existingRoles = await roleService.find();
  const roleNames = existingRoles.map((r: any) => r.type);

  const requiredRoles = [
    {
      name: 'Student',
      type: 'student',
      description: 'Can enroll in courses, view lessons, take quizzes',
    },
    {
      name: 'Instructor',
      type: 'instructor',
      description: 'Can manage lessons and quizzes in own courses',
    },
    {
      name: 'Content-Manager',
      type: 'content-manager',
      description: 'Can create and manage all content',
    },
    {
      name: 'Admin',
      type: 'admin-role',
      description: 'Full platform control',
    },
  ];

  for (const role of requiredRoles) {
    if (!roleNames.includes(role.type)) {
      await roleService.createRole({
        ...role,
        permissions: {},
      });
      strapi.log.info(`Created role: ${role.name}`);
    }
  }
}
