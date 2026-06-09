import { api } from './api.js';

export const getProgress = () => api.get('/students/progress');
export const getInstructors = (area) => api.get(`/instructors${area ? `?area=${area}` : ''}`);
export const getMyStudents = () => api.get('/students/my-students');
export const getAchievements = () => api.get('/students/achievements');
// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
export const chooseInstructor = (instructorId) => api.put('/students/choose-instructor', { instructorId });
export const submitLessonFeedback = (data) => api.post('/communication/feedback', data);
export const getMyLessonFeedback = () => api.get('/communication/feedback');
