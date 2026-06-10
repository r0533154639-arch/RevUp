import { getAllInstructors, getInstructorSchedule, approveLessonById, updateProfileImage } from '../dal/instructors.dal.js';

export const getInstructors = async (req, res) => {
  try {
    console.log('Getting instructors with query:', req.query);
    const data = await getAllInstructors(req.query);
    console.log('Instructors found:', data.length);
    res.json(data);
  } catch (err) {
    console.error('Error getting instructors:', err);
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
