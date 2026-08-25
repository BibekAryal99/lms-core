/**
 * Seed script for LMS
 * Run with: npx strapi ts-script scripts/seed.ts
 *
 * Creates sample users, courses, lessons, quizzes, and blog posts
 */
import type { Core } from '@strapi/strapi';

export default async () => {
  const strapi = global.strapi as Core.Strapi;
  if (!strapi) {
    console.error('Strapi instance not available. Run with: npx strapi ts-script scripts/seed.ts');
    return;
  }

  console.log('🌱 Starting seed...');

  // Get or create roles
  const roleService = strapi.plugin('users-permissions').service('role');
  const roles = await roleService.find();

  const studentRole = roles.find((r: any) => r.type === 'student');
  const instructorRole = roles.find((r: any) => r.type === 'instructor');
  const contentManagerRole = roles.find((r: any) => r.type === 'content-manager');
  const adminRole = roles.find((r: any) => r.type === 'admin-role');

  if (!studentRole || !instructorRole || !contentManagerRole || !adminRole) {
    console.error('Roles not found. Please start Strapi once to seed roles first.');
    return;
  }

  // Create sample users
  const userService = strapi.plugin('users-permissions').service('user');

  const users = [
    { username: 'admin', email: 'admin@lms.com', password: 'Admin@123', confirmed: true, role: adminRole.id },
    { username: 'content_mgr', email: 'content@lms.com', password: 'Content@123', confirmed: true, role: contentManagerRole.id },
    { username: 'instructor1', email: 'instructor1@lms.com', password: 'Instructor@123', confirmed: true, role: instructorRole.id },
    { username: 'instructor2', email: 'instructor2@lms.com', password: 'Instructor@123', confirmed: true, role: instructorRole.id },
    { username: 'student1', email: 'student1@lms.com', password: 'Student@123', confirmed: true, role: studentRole.id },
    { username: 'student2', email: 'student2@lms.com', password: 'Student@123', confirmed: true, role: studentRole.id },
  ];

  const createdUsers: any[] = [];
  for (const userData of users) {
    try {
      const existing = await userService.findOne({ email: userData.email });
      if (existing) {
        console.log(`  ℹ️  User ${userData.username} already exists, skipping`);
        createdUsers.push(existing);
        continue;
      }
      const user = await userService.add(userData);
      createdUsers.push(user);
      console.log(`  ✅ Created user: ${userData.username} (${userData.role === adminRole.id ? 'Admin' : userData.role === contentManagerRole.id ? 'Content Manager' : userData.role === instructorRole.id ? 'Instructor' : 'Student'})`);
    } catch (err: any) {
      console.log(`  ⚠️  Could not create user ${userData.username}: ${err.message}`);
    }
  }

  // Find created users by role
  const adminUser = createdUsers.find((u: any) => u.role?.type === 'admin-role');
  const cmUser = createdUsers.find((u: any) => u.role?.type === 'content-manager');
  const instructor1 = createdUsers.find((u: any) => u.username === 'instructor1');
  const instructor2 = createdUsers.find((u: any) => u.username === 'instructor2');
  const student1 = createdUsers.find((u: any) => u.username === 'student1');
  const student2 = createdUsers.find((u: any) => u.username === 'student2');

  if (!instructor1 || !student1) {
    console.error('Required users not created. Aborting seed.');
    return;
  }

  // Create sample courses
  const courseData = [
    {
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript. Perfect for beginners who want to start their web development journey.',
      author: instructor1.documentId,
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Advanced React Patterns',
      description: 'Deep dive into React hooks, context, render props, and advanced state management patterns.',
      author: instructor1.documentId,
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Node.js Backend Development',
      description: 'Build scalable backend APIs with Node.js, Express, and MongoDB.',
      author: instructor2.documentId,
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Draft Course - Machine Learning',
      description: 'This course is still in draft mode and not yet published.',
      author: instructor2.documentId,
      // No publishedAt = draft
    },
  ];

  const createdCourses: any[] = [];
  for (const data of courseData) {
    try {
      const course = await strapi.documents('api::course.course').create({ data });
      createdCourses.push(course);
      console.log(`  ✅ Created course: ${course.title}`);
    } catch (err: any) {
      console.log(`  ⚠️  Could not create course: ${err.message}`);
    }
  }

  // Create lessons for each course
  const lessonSets = [
    // Course 1: Web Dev
    [
      { title: 'What is HTML?', content: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages.', order: 1 },
      { title: 'CSS Basics', content: 'CSS (Cascading Style Sheets) is used to style and layout web pages.', order: 2 },
      { title: 'Introduction to JavaScript', content: 'JavaScript is a programming language that enables interactive web pages.', order: 3 },
      { title: 'DOM Manipulation', content: 'The Document Object Model (DOM) represents the page structure that JavaScript can modify.', order: 4 },
      { title: 'Building Your First Website', content: 'In this lesson, we will combine HTML, CSS, and JavaScript to build a complete website.', order: 5 },
    ],
    // Course 2: Advanced React
    [
      { title: 'React Hooks Deep Dive', content: 'Hooks let you use state and other React features without writing a class.', order: 1 },
      { title: 'Context API Advanced', content: 'Context provides a way to pass data through the component tree without manually passing props.', order: 2 },
      { title: 'Custom Hooks', content: 'Custom hooks allow you to extract component logic into reusable functions.', order: 3 },
      { title: 'Performance Optimization', content: 'Learn about React.memo, useMemo, useCallback, and code splitting.', order: 4 },
    ],
    // Course 3: Node.js Backend
    [
      { title: 'Node.js Fundamentals', content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine.', order: 1 },
      { title: 'Express.js Setup', content: 'Express is a minimal and flexible Node.js web application framework.', order: 2 },
      { title: 'RESTful API Design', content: 'Learn how to design clean and maintainable REST APIs.', order: 3 },
      { title: 'Database Integration', content: 'Connect your Express app to MongoDB and other databases.', order: 4 },
      { title: 'Authentication & Authorization', content: 'Implement JWT-based authentication in your Node.js applications.', order: 5 },
    ],
  ];

  for (let i = 0; i < createdCourses.length && i < lessonSets.length; i++) {
    const course = createdCourses[i];
    if (course.publishedAt) {
      for (const lessonData of lessonSets[i]) {
        try {
          const lesson = await strapi.documents('api::lesson.lesson').create({
            data: {
              ...lessonData,
              course: course.documentId,
            },
          });
          console.log(`  ✅ Created lesson: ${lesson.title}`);
        } catch (err: any) {
          console.log(`  ⚠️  Could not create lesson: ${err.message}`);
        }
      }
    }
  }

  // Create quizzes for published courses
  if (createdCourses.length > 0) {
    // Quiz for Course 1
    const quiz1 = await strapi.documents('api::quiz.quiz').create({
      data: {
        title: 'Web Development Basics Quiz',
        course: createdCourses[0].documentId,
      },
    });

    const quizQuestions1 = [
      {
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
        correctAnswer: 0,
        quiz: quiz1.documentId,
      },
      {
        question: 'Which CSS property is used to change text color?',
        options: ['font-color', 'text-color', 'color', 'foreground'],
        correctAnswer: 2,
        quiz: quiz1.documentId,
      },
      {
        question: 'What is the correct way to declare a JavaScript variable?',
        options: ['variable x = 5;', 'v x = 5;', 'let x = 5;', 'var: x = 5;'],
        correctAnswer: 2,
        quiz: quiz1.documentId,
      },
    ];

    for (const q of quizQuestions1) {
      await strapi.documents('api::quiz-question.quiz-question').create({ data: q });
    }
    console.log(`  ✅ Created quiz: ${quiz1.title} with ${quizQuestions1.length} questions`);

    // Quiz for Course 3
    const quiz3 = await strapi.documents('api::quiz.quiz').create({
      data: {
        title: 'Node.js Fundamentals Quiz',
        course: createdCourses[2].documentId,
      },
    });

    const quizQuestions3 = [
      {
        question: 'What is Node.js?',
        options: ['A programming language', 'A JavaScript runtime', 'A database', 'An operating system'],
        correctAnswer: 1,
        quiz: quiz3.documentId,
      },
      {
        question: 'Which module is used to create HTTP servers in Node.js?',
        options: ['fs', 'http', 'path', 'url'],
        correctAnswer: 1,
        quiz: quiz3.documentId,
      },
    ];

    for (const q of quizQuestions3) {
      await strapi.documents('api::quiz-question.quiz-question').create({ data: q });
    }
    console.log(`  ✅ Created quiz: ${quiz3.title} with ${quizQuestions3.length} questions`);
  }

  // Create sample enrollments
  if (student1 && createdCourses.length > 0) {
    try {
      await strapi.documents('api::enrollment.enrollment').create({
        data: {
          user: student1.documentId || student1.id,
          course: createdCourses[0].documentId,
        },
      });
      console.log(`  ✅ Enrolled student1 in: ${createdCourses[0].title}`);

      await strapi.documents('api::enrollment.enrollment').create({
        data: {
          user: student1.documentId || student1.id,
          course: createdCourses[1].documentId,
        },
      });
      console.log(`  ✅ Enrolled student1 in: ${createdCourses[1].title}`);
    } catch (err: any) {
      console.log(`  ⚠️  Could not create enrollment: ${err.message}`);
    }
  }

  if (student2 && createdCourses.length > 0) {
    try {
      await strapi.documents('api::enrollment.enrollment').create({
        data: {
          user: student2.documentId || student2.id,
          course: createdCourses[0].documentId,
        },
      });
      console.log(`  ✅ Enrolled student2 in: ${createdCourses[0].title}`);
    } catch (err: any) {
      console.log(`  ⚠️  Could not create enrollment: ${err.message}`);
    }
  }

  // Create sample blog posts
  if (cmUser) {
    try {
      await strapi.documents('api::blog-post.blog-post').create({
        data: {
          title: 'Welcome to Our LMS Platform',
          body: 'We are excited to launch our new Learning Management System. Explore courses, track your progress, and earn certificates!',
          coverImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
          author: cmUser.documentId || cmUser.id,
          publishedAt: new Date().toISOString(),
        },
      });
      console.log(`  ✅ Created blog post: Welcome to Our LMS Platform`);

      await strapi.documents('api::blog-post.blog-post').create({
        data: {
          title: 'Tips for Effective Online Learning',
          body: 'Here are some tips to make the most of your online learning experience: set a schedule, take notes, and practice regularly.',
          coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
          author: cmUser.documentId || cmUser.id,
          publishedAt: new Date().toISOString(),
        },
      });
      console.log(`  ✅ Created blog post: Tips for Effective Online Learning`);

      // Draft post
      await strapi.documents('api::blog-post.blog-post').create({
        data: {
          title: 'Upcoming Features - Draft',
          body: 'We are working on new features including live classes and certificates...',
          author: cmUser.documentId || cmUser.id,
          // No publishedAt = draft
        },
      });
      console.log(`  ✅ Created draft blog post: Upcoming Features`);
    } catch (err: any) {
      console.log(`  ⚠️  Could not create blog posts: ${err.message}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:             admin@lms.com / Admin@123');
  console.log('  Content Manager:   content@lms.com / Content@123');
  console.log('  Instructor 1:      instructor1@lms.com / Instructor@123');
  console.log('  Instructor 2:      instructor2@lms.com / Instructor@123');
  console.log('  Student 1:         student1@lms.com / Student@123');
  console.log('  Student 2:         student2@lms.com / Student@123');
};
