# 📚 LMS Backend - Learning Management System

A full-featured Learning Management System backend built with **Strapi 5**. Powers course management, enrollment, progress tracking, quiz auto-grading, blog posts, and role-based access control.

## 🚀 Features

### Core Features
- ✅ **Authentication + Role-based Access** — 4 roles (Admin, Content Manager, Instructor, Student) with strict permission enforcement
- ✅ **Course Management** — Create/edit/delete courses with title, description, cover image
- ✅ **Lesson Management** — Add lessons with text content and video URLs, ordered within courses
- ✅ **Course Enrollment** — Students browse and enroll in courses
- ✅ **Lesson Viewing** — Sequential lesson viewing for enrolled students

### Differentiator Features
- ✅ **Progress Tracking** — Mark lessons complete, accurate per-student/per-course percentage
- ✅ **Quiz with Auto-Grading** — MCQ quizzes with automatic scoring and result storage
- ✅ **Admin Panel API** — User management, role changes, platform statistics
- ✅ **Blog System** — Draft/published states, author-based management

## 📋 Permission Matrix

| Action | Admin | Content Manager | Instructor | Student |
|--------|-------|----------------|------------|---------|
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| Create/edit/delete courses | ✅ | ✅ | Own only | ❌ |
| Add/edit/delete lessons | ✅ | ✅ | Own courses | ❌ |
| Create quizzes | ✅ | ✅ | Own courses | ❌ |
| View student progress | ✅ | ✅ | Own courses | Own only |
| Write/manage blog posts | ✅ | ✅ | ❌ | ❌ |
| Enroll in courses | ❌ | ❌ | ❌ | ✅ |
| Take quizzes | ❌ | ❌ | ❌ | ✅ |

## 🛠️ Tech Stack

- **Backend/CMS**: Strapi 5.52.1
- **Database**: SQLite (development) / PostgreSQL (production)
- **Runtime**: Node.js >= 20

## 🏃 Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 6

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your secrets

# Start development server
npm run develop

# Seed sample data (in another terminal after Strapi starts)
npx strapi ts-script scripts/seed.ts
```

### Build for Production

```bash
npm run build
npm start
```

## 📊 API Endpoints

### Content APIs (REST)
- `GET/POST /api/courses` — List/create courses
- `GET/PUT/DELETE /api/courses/:id` — Read/update/delete course
- `GET/POST /api/lessons` — List/create lessons
- `GET/POST /api/quizzes` — List/create quizzes
- `GET/POST /api/quiz-questions` — List/create quiz questions
- `GET/POST /api/enrollments` — List/enroll in courses
- `GET/POST /api/lesson-progresses` — Track lesson completion
- `GET/POST /api/quiz-results` — Submit/view quiz results
- `GET/POST /api/blog-posts` — List/create blog posts

### Custom LMS Endpoints
- `GET /api/lms/progress/:courseDocumentId` — Course progress percentage
- `GET /api/lms/my-courses` — Enrolled courses with progress
- `GET /api/lms/enrolled-students` — Instructor view of students
- `GET /api/lms/stats` — Admin platform statistics

### Admin Endpoints
- `GET /api/admin/users` — List all users (admin only)
- `PUT /api/admin/users/:userId/role` — Change user role (admin only)
- `GET /api/admin/courses` — List all courses with details

## 🔐 Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | Admin@123 |
| Content Manager | content@lms.com | Content@123 |
| Instructor 1 | instructor1@lms.com | Instructor@123 |
| Instructor 2 | instructor2@lms.com | Instructor@123 |
| Student 1 | student1@lms.com | Student@123 |
| Student 2 | student2@lms.com | Student@123 |

## 📁 Project Structure

```
├── config/               # Strapi configuration
│   ├── admin.ts
│   ├── api.ts
│   ├── database.ts
│   ├── middlewares.ts     # CORS config for frontend
│   ├── plugins.ts
│   └── server.ts
├── scripts/
│   └── seed.ts           # Sample data seeder
├── src/
│   ├── index.ts          # Bootstrap (role seeding)
│   └── api/
│       ├── blog-post/     # Blog content type
│       ├── course/        # Course content type
│       ├── enrollment/    # Enrollment content type
│       ├── lesson/        # Lesson content type
│       ├── lesson-progress/ # Progress tracking
│       ├── lms/           # Custom LMS endpoints
│       │   ├── controllers/
│       │   └── routes/
│       ├── quiz/          # Quiz content type
│       ├── quiz-question/ # Quiz questions
│       └── quiz-result/   # Quiz grading results
└── database/
    └── migrations/
```

## 🌐 Deployment

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables from `.env.example`
3. Use PostgreSQL add-on for production database
4. Set `DATABASE_CLIENT=postgres` and configure connection

### Frontend (Vercel)
- Deploy Next.js frontend separately
- Set `NEXT_PUBLIC_STRAPI_URL` to your Railway backend URL

## 📝 License

Private - LMS Project
