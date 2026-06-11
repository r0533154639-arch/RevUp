import { getStudentProgress, setStudentStatus, getStudentsByInstructor, chooseInstructor, getInstructorAchievements, getStudentInstructor, updateProfileImage, findUserById } from '../dal/students.dal.js';
import { sendLicensedEmail, sendStudentEnrolledEmail } from '../services/mailer.js';
import pool from '../config/db.js';

export const getProgress = async (req, res) => {
  const data = await getStudentProgress(req.user.id);
  res.json(data);
};

export const updateStatus = async (req, res) => {
  const targetId = req.body.studentId ?? req.user.id;
  await setStudentStatus(targetId, req.body.status);
  if (req.body.status === 'licensed') {
    const user = await findUserById(targetId);
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
  try {
    const student = await findUserById(req.user.id);
    const [[instrUser]] = await pool.query(
      'SELECT u.email, u.name FROM users u JOIN driving_instructor di ON di.user_id = u.id WHERE di.user_id = ?',
      [req.body.instructorId]
    );
    if (student && instrUser)
      sendStudentEnrolledEmail(instrUser.email, instrUser.name, student.name).catch(console.error);
  } catch {}
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
