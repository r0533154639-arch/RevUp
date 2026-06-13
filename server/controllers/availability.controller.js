import {
  getWeeklyTemplate, saveWeeklyTemplate,
  getOverrides, saveOverride,
  getAvailableSlotsForDate,
  getLessonsConflictingWithTemplate, cancelConflictingLessons,
  slotToTime
} from '../dal/availability.dal.js';
import pool from '../config/db.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getTemplate = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  const rows = await getWeeklyTemplate(userId);
  const template = {};
  for (const r of rows) {
    if (!template[r.day_of_week]) template[r.day_of_week] = [];
    template[r.day_of_week].push(r.slot_index);
  }
  res.json(template);
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const { slots, forceCancel } = req.body;

  if (!forceCancel) {
    const conflicts = await getLessonsConflictingWithTemplate(req.user.id, slots);
    if (conflicts.length > 0) {
      return res.json({ conflicts, requiresConfirmation: true });
    }
  } else {
    const conflicts = await getLessonsConflictingWithTemplate(req.user.id, slots);
    await cancelConflictingLessons(conflicts.map(c => c.id));
  }

  await saveWeeklyTemplate(req.user.id, slots);
  res.json({ success: true });
});

export const getDateOverrides = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const userId = req.params.userId || req.user.id;
  const rows = await getOverrides(userId, dateFrom, dateTo);
  res.json(rows);
});

export const updateDateOverride = asyncHandler(async (req, res) => {
  const { date, slots } = req.body;
  await saveOverride(req.user.id, date, slots);
  res.json({ success: true });
});

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const instructorUserId = req.params.userId;
  if (!date || !instructorUserId)
    return res.status(400).json({ message: 'date and userId are required' });
  const slots = await getAvailableSlotsForDate(instructorUserId, date);
  res.json(slots);
});

export const rejectCancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const [[lesson]] = await pool.query(
    `SELECT dl.*, di.user_id AS instructor_user_id
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     WHERE dl.id = ?`,
    [id]
  );
  if (!lesson) return res.status(404).json({ message: 'שיעור לא נמצא' });

  const isStudent = role === 'student' && lesson.student_id === userId;
  const isInstructor = role === 'instructor' && lesson.instructor_user_id === userId;
  if (!isStudent && !isInstructor)
    return res.status(403).json({ message: 'אין הרשאה' });

  await pool.query(
    `UPDATE driving_lessons SET cancel_requested_by = NULL, cancel_rejected_by = ? WHERE id = ?`,
    [role, id]
  );
  res.json({ success: true });
});

export const cancelLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const [[lesson]] = await pool.query(
    `SELECT dl.*, di.user_id AS instructor_user_id,
            DATEDIFF(dl.date, CURDATE()) AS days_until
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     WHERE dl.id = ?`,
    [id]
  );
  if (!lesson) return res.status(404).json({ message: 'שיעור לא נמצא' });

  const isStudent = role === 'student' && lesson.student_id === userId;
  const isInstructor = role === 'instructor' && lesson.instructor_user_id === userId;
  if (!isStudent && !isInstructor && role !== 'admin')
    return res.status(403).json({ message: 'אין הרשאה' });

  if (lesson.days_until >= 2 || role === 'admin') {
    await pool.query(`DELETE FROM driving_lessons WHERE id = ?`, [id]);
    return res.json({ success: true, cancelled: true });
  }

  const requestedBy = role;
  const currentRequest = lesson.cancel_requested_by;

  if (currentRequest && currentRequest !== requestedBy) {
    await pool.query(`DELETE FROM driving_lessons WHERE id = ?`, [id]);
    return res.json({ success: true, cancelled: true });
  }

  await pool.query(
    `UPDATE driving_lessons SET cancel_requested_by = ? WHERE id = ?`,
    [requestedBy, id]
  );
  res.json({ success: true, cancelled: false, message: 'בקשת הביטול נשלחה. השיעור יתבטל רק לאחר אישור הצד השני.' });
});
