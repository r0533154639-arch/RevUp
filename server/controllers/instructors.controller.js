import { getAllInstructors, getInstructorSchedule, approveLessonById, updateProfileImage, completeInstructorProfile, getInstructorProfileStatus } from '../dal/instructors.dal.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getInstructors = asyncHandler(async (req, res) => {
  const { areas, vehicle_types, min_rating } = req.query;
  const data = await getAllInstructors({
    areas: areas ? areas.split(',') : [],
    vehicle_types: vehicle_types ? vehicle_types.split(',') : [],
    min_rating: min_rating || null,
  });
  res.json(data);
});

export const getSchedule = asyncHandler(async (req, res) => {
  const data = await getInstructorSchedule(req.params.id);
  res.json(data);
});

export const approveLesson = asyncHandler(async (req, res) => {
  await approveLessonById(req.params.id);
  res.json({ success: true });
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  await updateProfileImage(req.user.id, req.file.filename);
  res.json({ success: true, filename: req.file.filename });
});

export const completeProfile = asyncHandler(async (req, res) => {
  const { area, vehicle_types, years_experience } = req.body;
  if (!area) return res.status(400).json({ message: 'אזור לימוד הוא שדה חובה' });
  await completeInstructorProfile(req.user.id, { area, vehicle_types, years_experience });
  const profile_status = await getInstructorProfileStatus(req.user.id);
  res.json({ success: true, profile_status });
});
