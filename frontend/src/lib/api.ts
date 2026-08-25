import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (identifier: string, password: string) =>
    api.post('/auth/local', { identifier, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/local/register', { username, email, password }),
  
  getMe: () => api.get('/users/me?populate=role'),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getOne: (documentId: string) => api.get(`/courses/${documentId}?populate=*`),
  create: (data: any) => api.post('/courses', { data }),
  update: (documentId: string, data: any) => api.put(`/courses/${documentId}`, { data }),
  delete: (documentId: string) => api.delete(`/courses/${documentId}`),
};

// Lessons API
export const lessonsAPI = {
  getAll: (params?: any) => api.get('/lessons', { params }),
  getOne: (documentId: string) => api.get(`/lessons/${documentId}?populate=course`),
  create: (data: any) => api.post('/lessons', { data }),
  update: (documentId: string, data: any) => api.put(`/lessons/${documentId}`, { data }),
  delete: (documentId: string) => api.delete(`/lessons/${documentId}`),
};

// Quizzes API
export const quizzesAPI = {
  getAll: (params?: any) => api.get('/quizzes', { params }),
  getOne: (documentId: string) => api.get(`/quizzes/${documentId}?populate=questions`),
  create: (data: any) => api.post('/quizzes', { data }),
  update: (documentId: string, data: any) => api.put(`/quizzes/${documentId}`, { data }),
  delete: (documentId: string) => api.delete(`/quizzes/${documentId}`),
};

// Quiz Questions API
export const quizQuestionsAPI = {
  getAll: (params?: any) => api.get('/quiz-questions', { params }),
  create: (data: any) => api.post('/quiz-questions', { data }),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: (params?: any) => api.get('/enrollments', { params }),
  create: (data: any) => api.post('/enrollments', { data }),
};

// Lesson Progress API
export const progressAPI = {
  getAll: (params?: any) => api.get('/lesson-progresses', { params }),
  markComplete: (lessonDocumentId: string) =>
    api.post('/lesson-progresses', {
      data: { lesson: lessonDocumentId, completed: true },
    }),
};

// Quiz Results API
export const quizResultsAPI = {
  getAll: (params?: any) => api.get('/quiz-results', { params }),
  submit: (quizDocumentId: string, answers: Record<string, number>) =>
    api.post('/quiz-results', {
      data: { quiz: quizDocumentId, answers },
    }),
};

// Blog Posts API
export const blogAPI = {
  getAll: (params?: any) => api.get('/blog-posts', { params }),
  getOne: (documentId: string) => api.get(`/blog-posts/${documentId}?populate=author`),
  create: (data: any) => api.post('/blog-posts', { data }),
  update: (documentId: string, data: any) => api.put(`/blog-posts/${documentId}`, { data }),
  delete: (documentId: string) => api.delete(`/blog-posts/${documentId}`),
};

// LMS Custom API
export const lmsAPI = {
  getCourseProgress: (courseDocumentId: string) =>
    api.get(`/lms/progress/${courseDocumentId}`),
  getMyCourses: () => api.get('/lms/my-courses'),
  getEnrolledStudents: () => api.get('/lms/enrolled-students'),
  getStats: () => api.get('/lms/stats'),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: string, roleName: string) =>
    api.put(`/admin/users/${userId}/role`, { roleName }),
  getAllCourses: () => api.get('/admin/courses'),
};

export default api;
