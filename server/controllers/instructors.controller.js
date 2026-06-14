import { fetchInstructors, completeProfile as completeProfileService, uploadInstructorPhoto } from '../services/instructor.service.js';
import { getInstructorSchedule, approveLessonById } from '../dal/instructors.dal.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getInstructors  = asyncHandler(async (req, res) => {
  const { areas, vehicle_types, min_rating } = req.query;
  res.json(await fetchInstructors({
    areas: areas ? areas.split(',') : [],
    vehicle_types: vehicle_types ? vehicle_types.split(',') : [],
    min_rating: min_rating || null,
  }));
});

export const getSchedule      = asyncHandler(async (req, res) => res.json(await getInstructorSchedule(req.params.id)));
export const approveLesson    = asyncHandler(async (req, res) => { await approveLessonById(req.params.id); res.json({ success: true }); });
export const completeProfile  = asyncHandler(async (req, res) => res.json({ success: true, profile_status: await completeProfileService(req.user.id, req.body) }));
export const uploadPhoto      = asyncHandler(async (req, res) => res.json({ success: true, filename: await uploadInstructorPhoto(req.user.id, req.file) }));
