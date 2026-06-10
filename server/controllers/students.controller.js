import { getStudentProgress, setStudentStatus, getStudentsByInstructor, chooseInstructor, getInstructorAchievements, getStudentInstructor, updateProfileImage } from '../dal/students.dal.js';
import { findUserById } from '../dal/students.dal.js';
import { sendLicensedEmail } from '../services/mailer.js';

export const getProgress = async (req, res) => {
  const data = await getStudentProgress(req.user.id);
  res.json(data);
};

export const updateStatus = async (req, res) => {
  await setStudentStatus(req.user.id, req.body.status);
  if (req.body.status === 'licensed') {
    const user = await findUserById(req.user.id);
    if (user) sendLicensedEmail(user.email, user.name).catch(console.error);
  }
  res.json({ success: true });
};

export const getMyStudents = async (req, res) => {
  const data = await getStudentsByInstructor(req.user.id, req.user.role);
  res.json(data);
};

export const selectInstructor = async (req, res) => {
  await chooseInstructor(req.user.id, req.body.instructorId);
  res.json({ success: true });
};

export const getAchievements = async (req, res) => {
  try {
    const data = await getInstructorAchievements(req.user.id, req.user.role);
    res.json(data);
  } catch (err) {
    console.error('getAchievements error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getMyInstructor = async (req, res) => {
  const data = await getStudentInstructor(req.user.id);
  res.json({ instructor_id: data?.instructor_id ?? null });
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
