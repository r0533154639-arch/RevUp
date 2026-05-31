import { api } from './api.js';

export const getLessons = () => api.get('/lessons');
export const scheduleLesson = (data) => api.post('/lessons', data);
export const submitFeedback = (id, data) => api.post(`/lessons/${id}/feedback`, data);
