import { api } from './api.js';

export const getProgress = () => api.get('/students/progress');
export const getInstructors = ({ areas, vehicleTypes, minRating } = {}) => {
  const params = new URLSearchParams();
  if (areas?.length) params.append('areas', areas.join(','));
  if (vehicleTypes?.length) params.append('vehicle_types', vehicleTypes.join(','));
  if (minRating) params.append('min_rating', minRating);
  const qs = params.toString();
  return api.get(`/instructors${qs ? `?${qs}` : ''}`);
};
export const getMyStudents = () => api.get('/students/my-students');
export const updateStudentStatus = (studentId, status) => api.put('/students/status', { studentId, status });
export const getAchievements = () => api.get('/students/achievements');
// TODO: להסיר כשיהיה תהליך בחירת מורה אמיתי
export const getMyInstructor = () => api.get('/students/my-instructor');
export const chooseInstructor = (instructorId) => api.put('/students/choose-instructor', { instructorId });
export const submitLessonFeedback = (data) => api.post('/communication/feedback', data);
export const getMyLessonFeedback = () => api.get('/communication/feedback');
