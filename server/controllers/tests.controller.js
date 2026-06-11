import {
  getTestsByStudent, createTest, createAppeal,
  getCompletedLessonsCount, getTestRequest, createTestRequest,
  getLatestTest, getTestRequestsForInstructor
} from '../dal/tests.dal.js';
import pool from '../config/db.js';

export const getTests = async (req, res) => {
  const data = await getTestsByStudent(req.user.id);
  res.json(data);
};

export const scheduleTest = async (req, res) => {
  const id = await createTest({ ...req.body, studentId: req.user.id });
  res.status(201).json({ id });
};

export const submitAppeal = async (req, res) => {
  await createAppeal(req.params.id, req.body);
  res.json({ success: true });
};

export const getTestStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

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

      if (testDate < today) {
        return res.json({ phase: 'result', test: latestTest });
      }
    }

    const testRequest = await getTestRequest(studentId);
    if (testRequest) {
      return res.json({ phase: 'requested', completedLessons });
    }

    return res.json({ phase: 'eligible', completedLessons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const requestTest = async (req, res) => {
  try {
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

    await createTestRequest(studentId, ds.instructor_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyTestRequests = async (req, res) => {
  try {
    const [[instr]] = await pool.query(
      'SELECT id FROM driving_instructor WHERE user_id = ?',
      [req.user.id]
    );
    if (!instr) return res.json([]);
    const data = await getTestRequestsForInstructor(instr.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
