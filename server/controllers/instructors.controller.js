import { getAllInstructors, getInstructorSchedule, approveLessonById, updateProfileImage } from '../dal/instructors.dal.js';

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
    const filename = req.file.filename;
    await updateProfileImage(req.user.id, filename);
    res.json({ success: true, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};
