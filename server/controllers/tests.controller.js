import {
  getTestsByStudent, createTest, createAppeal,
  getCompletedLessonsCount, getTestRequest, createTestRequest,
  getLatestTest, getTestRequestsForInstructor, scheduleTestByInstructor as scheduleTestDAL
} from '../dal/tests.dal.js';
import pool from '../config/db.js';
import { sendTestRequestEmail, sendTestScheduledEmail } from '../services/mailer.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getTests = asyncHandler(async (req, res) => {
  const data = await getTestsByStudent(req.user.id);
  res.json(data);
});

export const scheduleTest = asyncHandler(async (req, res) => {
  const id = await createTest({ ...req.body, studentId: req.user.id });
  res.status(201).json({ id });
});

export const submitAppeal = asyncHandler(async (req, res) => {
  await createAppeal(req.params.id, req.body);
  res.json({ success: true });
});

export const getTestStatus = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const [[ds]] = await pool.query('SELECT status FROM driving_students WHERE user_id = ?', [studentId]);
  if (ds?.status === 'licensed') {
    return res.json({ phase: 'licensed' });
  }

  const completedLessons = await getCompletedLessonsCount(studentId);

  if (completedLessons < 28) {
    return res.json({ phase: 'not_eligible', completedLessons });
  }

  const latestTest = await getLatestTest(studentId);

  if (latestTest) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const testDate = new Date(latestTest.date);
    testDate.setHours(0, 0, 0, 0);

    if (testDate >= today && latestTest.status === 'scheduled') {
      return res.json({ phase: 'scheduled', test: latestTest });
    }

    if (testDate < today || latestTest.status === 'passed' || latestTest.status === 'failed') {
      if (latestTest.status === 'passed') {
        return res.json({ phase: 'licensed' });
      }
      return res.json({ phase: 'result', test: latestTest });
    }
  }

  const testRequest = await getTestRequest(studentId);
  if (testRequest) {
    return res.json({ phase: 'requested', completedLessons });
  }

  return res.json({ phase: 'eligible', completedLessons });
});

export const requestTest = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const completedLessons = await getCompletedLessonsCount(studentId);
  if (completedLessons < 28) {
    return res.status(403).json({ message: 'לא מספיק שיעורים' });
  }

  const [[ds]] = await pool.query(
    'SELECT instructor_id FROM driving_students WHERE user_id = ?',
    [studentId]
  );
  if (!ds?.instructor_id) {
    return res.status(400).json({ message: 'אין מורה מקושר' });
  }

  const [[instructor]] = await pool.query(
    'SELECT u.name AS instructor_name, u.email AS instructor_email FROM driving_instructor di JOIN users u ON u.id = di.user_id WHERE di.id = ?',
    [ds.instructor_id]
  );
  const [[student]] = await pool.query(
    'SELECT name AS student_name FROM users WHERE id = ?',
    [studentId]
  );

  await createTestRequest(studentId, ds.instructor_id);
  await pool.query(
    'UPDATE driving_students SET status = "test" WHERE user_id = ?',
    [studentId]
  );
  
  if (instructor?.instructor_email) {
    sendTestRequestEmail(instructor.instructor_email, instructor.instructor_name, student.student_name);
  }
  
  res.json({ success: true });
});

export const getMyTestRequests = asyncHandler(async (req, res) => {
  const [[instr]] = await pool.query(
    'SELECT id FROM driving_instructor WHERE user_id = ?',
    [req.user.id]
  );
  if (!instr) return res.json([]);
  const data = await getTestRequestsForInstructor(instr.id);
  res.json(data);
});

export const scheduleTestByInstructor = asyncHandler(async (req, res) => {
  const { testRequestId, date, time } = req.body;
  
  const [[request]] = await pool.query(
    'SELECT tr.student_id, u.name AS student_name, u.email AS student_email FROM test_requests tr JOIN users u ON u.id = tr.student_id WHERE tr.id = ?',
    [testRequestId]
  );
  if (!request) {
    return res.status(404).json({ message: 'Test request not found' });
  }
  
  const testId = await scheduleTestDAL(testRequestId, { date, time });
  
  if (request.student_email) {
    sendTestScheduledEmail(request.student_email, request.student_name, date, time);
  }
  
  res.json({ success: true, testId });
});
