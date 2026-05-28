import { api } from './api.js';

export const getProgress = () => api.get('/students/progress');
export const getInstructors = (area) => api.get(`/instructors${area ? `?area=${area}` : ''}`);
