import { getStudentProgress, setStudentStatus, getStudentsByInstructor, chooseInstructor, getInstructorAchievements, getStudentInstructor, updateProfileImage, findUserById } from '../dal/students.dal.js';
import { sendLicensedEmail, sendStudentEnrolledEmail } from '../services/mailer.js';
import pool from '../config/db.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getProgress = asyncHandler(async (req, res) => {
  const data = await getStudentProgress(req.user.id);
  res.json(data);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const targetId = req.body.studentId ?? req.user.id;
  await setStudentStatus(targetId, req.body.status);
  if (req.body.status === 'licensed') {
    const user = await findUserById(targetId);
    if (user) sendLicensedEmail(user.email, user.name).catch(console.error);
  }
  res.json({ success: true });
});

export const getMyStudents = asyncHandler(async (req, res) => {
  const data = await getStudentsByInstructor(req.user.id, req.user.role);
  res.json(data);
});

export const selectInstructor = asyncHandler(async (req, res) => {
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
});

export const getAchievements = asyncHandler(async (req, res) => {
  const data = await getInstructorAchievements(req.user.id, req.user.role);
  res.json(data);
});

export const getMyInstructor = asyncHandler(async (req, res) => {
  const data = await getStudentInstructor(req.user.id);
  res.json({ instructor_id: data?.instructor_id ?? null });
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const filename = req.file.filename;
  await updateProfileImage(req.user.id, filename);
  res.json({ success: true, filename });
});
