import pool from '../config/db.js';
import { getTestsByStudent, createTest, createAppeal, getCompletedLessonsCount, getTestRequest, createTestRequest, getLatestTest, getTestRequestsForInstructor, scheduleTestByInstructor as scheduleTestDAL } from '../dal/tests.dal.js';
import { sendTestRequestEmail, sendTestScheduledEmail } from '../utils/mailer.js';

const MIN_LESSONS = 28;

export const fetchTests = (studentId) => getTestsByStudent(studentId);

export const addTest = ({ studentId, ...body }) => createTest({ ...body, studentId });

export const addAppeal = (testId, body) => createAppeal(testId, body);

export const getTestPhase = async (studentId) => {
  const [[ds]] = await pool.query('SELECT status FROM driving_students WHERE user_id = ?', [studentId]);
  if (ds?.status === 'licensed') return { phase: 'licensed' };

  const completedLessons = await getCompletedLessonsCount(studentId);
  if (completedLessons < MIN_LESSONS) return { phase: 'not_eligible', completedLessons };

  const latestTest = await getLatestTest(studentId);
  if (latestTest) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const testDate = new Date(latestTest.date); testDate.setHours(0, 0, 0, 0);

    if (testDate >= today && latestTest.status === 'scheduled')
      return { phase: 'scheduled', test: latestTest };

    if (testDate < today || ['passed', 'failed'].includes(latestTest.status)) {
      if (latestTest.status === 'passed') return { phase: 'licensed' };
      return { phase: 'result', test: latestTest };
    }
  }

  const testRequest = await getTestRequest(studentId);
  if (testRequest) return { phase: 'requested', completedLessons };

  return { phase: 'eligible', completedLessons };
};

export const requestTest = async (studentId) => {
  const completedLessons = await getCompletedLessonsCount(studentId);
  if (completedLessons < MIN_LESSONS)
    throw Object.assign(new Error('לא מספיק שיעורים'), { status: 403 });

  const [[ds]] = await pool.query('SELECT instructor_id FROM driving_students WHERE user_id = ?', [studentId]);
  if (!ds?.instructor_id)
    throw Object.assign(new Error('אין מורה מקושר'), { status: 400 });

  const [[instructor]] = await pool.query(
    'SELECT u.name AS instructor_name, u.email AS instructor_email FROM driving_instructor di JOIN users u ON u.id = di.user_id WHERE di.id = ?',
    [ds.instructor_id]
  );
  const [[student]] = await pool.query('SELECT name AS student_name FROM users WHERE id = ?', [studentId]);

  await createTestRequest(studentId, ds.instructor_id);
  await pool.query('UPDATE driving_students SET status = "test" WHERE user_id = ?', [studentId]);

  if (instructor?.instructor_email)
    sendTestRequestEmail(instructor.instructor_email, instructor.instructor_name, student.student_name).catch(console.error);
};

export const fetchTestRequestsForInstructor = async (instructorUserId) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [instructorUserId]);
  if (!instr) return [];
  return getTestRequestsForInstructor(instr.id);
};

export const scheduleTestByInstructor = async ({ testRequestId, date, time }) => {
  const [[request]] = await pool.query(
    'SELECT tr.student_id, u.name AS student_name, u.email AS student_email FROM test_requests tr JOIN users u ON u.id = tr.student_id WHERE tr.id = ?',
    [testRequestId]
  );
  if (!request) throw Object.assign(new Error('Test request not found'), { status: 404 });

  const testId = await scheduleTestDAL(testRequestId, { date, time });
  if (request.student_email)
    sendTestScheduledEmail(request.student_email, request.student_name, date, time).catch(console.error);
  return testId;
};
