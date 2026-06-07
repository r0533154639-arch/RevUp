import { getAllInstructors, getInstructorSchedule, approveLessonById, saveInstructorPhoto } from '../dal/instructors.dal.js';

export const getInstructors = async (req, res) => {
  const data = await getAllInstructors(req.query);
  res.json(data);
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
  if (!req.file) return res.status(400).json({ message: 'לא נבחרה תמונה' });
  const photoUrl = `/uploads/${req.file.filename}`;
  await saveInstructorPhoto(req.user.id, photoUrl);
  res.json({ photo: photoUrl });
};
