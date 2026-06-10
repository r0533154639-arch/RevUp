import { getAllInstructors, getInstructorSchedule, approveLessonById, updateProfileImage, completeInstructorProfile, getInstructorProfileStatus } from '../dal/instructors.dal.js';

export const getInstructors = async (req, res) => {
  try {
    const { areas, vehicle_types, min_rating } = req.query;
    const data = await getAllInstructors({
      areas: areas ? areas.split(',') : [],
      vehicle_types: vehicle_types ? vehicle_types.split(',') : [],
      min_rating: min_rating || null,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSchedule = async (req, res) => {
  const data = await getInstructorSchedule(req.params.id);
  res.json(data);
};

export const approveLesson = async (req, res) => {
  await approveLessonById(req.params.id);
  res.json({ success: true });
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await updateProfileImage(req.user.id, req.file.filename);
    res.json({ success: true, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { area, vehicle_types, years_experience } = req.body;
    if (!area) return res.status(400).json({ message: 'אזור לימוד הוא שדה חובה' });
    await completeInstructorProfile(req.user.id, { area, vehicle_types, years_experience });
    const profile_status = await getInstructorProfileStatus(req.user.id);
    res.json({ success: true, profile_status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

