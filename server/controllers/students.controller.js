import { fetchProgress, fetchMyStudents, fetchAchievements, fetchMyInstructor, updateStudentStatus, selectInstructor as selectInstructorService, uploadStudentPhoto } from '../services/student.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getProgress       = asyncHandler(async (req, res) => res.json(await fetchProgress(req.user.id)));
export const updateStatus      = asyncHandler(async (req, res) => { await updateStudentStatus(req.body.studentId ?? req.user.id, req.body.status); res.json({ success: true }); });
export const getMyStudents     = asyncHandler(async (req, res) => res.json(await fetchMyStudents(req.user.id, req.user.role)));
export const selectInstructor = asyncHandler(async (req, res) => { await selectInstructorService(req.user.id, req.body.instructorId); res.json({ success: true }); });
export const getAchievements   = asyncHandler(async (req, res) => res.json(await fetchAchievements(req.user.id, req.user.role)));
export const getMyInstructor   = asyncHandler(async (req, res) => res.json(await fetchMyInstructor(req.user.id)));
export const uploadPhoto       = asyncHandler(async (req, res) => res.json({ success: true, filename: await uploadStudentPhoto(req.user.id, req.file) }));
