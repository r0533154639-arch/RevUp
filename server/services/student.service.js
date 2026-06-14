import pool from '../config/db.js';
import { getStudentProgress, setStudentStatus, getStudentsByInstructor, chooseInstructor, getInstructorAchievements, getStudentInstructor, updateProfileImage, findUserById } from '../dal/students.dal.js';
import { sendLicensedEmail, sendStudentEnrolledEmail } from '../utils/mailer.js';

export const fetchProgress    = (userId)         => getStudentProgress(userId);
export const fetchMyStudents  = (userId, role)   => getStudentsByInstructor(userId, role);
export const fetchAchievements= (userId, role)   => getInstructorAchievements(userId, role);
export const fetchMyInstructor= async (userId)   => {
  const data = await getStudentInstructor(userId);
  return { instructor_id: data?.instructor_id ?? null };
};

export const updateStudentStatus = async (studentId, status) => {
  await setStudentStatus(studentId, status);
  if (status === 'licensed') {
    const user = await findUserById(studentId);
    if (user) sendLicensedEmail(user.email, user.name).catch(console.error);
  }
};

export const selectInstructor = async (studentId, instructorId) => {
  await chooseInstructor(studentId, instructorId);
  const student = await findUserById(studentId);
  const [[instrUser]] = await pool.query(
    'SELECT u.email, u.name FROM users u JOIN driving_instructor di ON di.user_id = u.id WHERE di.user_id = ?',
    [instructorId]
  );
  if (student && instrUser)
    sendStudentEnrolledEmail(instrUser.email, instrUser.name, student.name).catch(console.error);
};

export const uploadStudentPhoto = async (userId, file) => {
  if (!file) throw Object.assign(new Error('No file uploaded'), { status: 400 });
  await updateProfileImage(userId, file.filename);
  return file.filename;
};
