import {
  getWeeklyTemplate, saveWeeklyTemplate,
  getOverrides, saveOverride,
  getAvailableSlotsForDate,
  getLessonsConflictingWithTemplate, cancelConflictingLessons,
  slotToTime
} from '../dal/availability.dal.js';
import pool from '../config/db.js';

export const getTemplate = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const rows = await getWeeklyTemplate(userId);
    // קיבוץ לפי יום
    const template = {};
    for (const r of rows) {
      if (!template[r.day_of_week]) template[r.day_of_week] = [];
      template[r.day_of_week].push(r.slot_index);
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { slots, forceCancel } = req.body;
    // slots = [{ day_of_week, slot_index }, ...]

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDateOverrides = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const userId = req.params.userId || req.user.id;
    const rows = await getOverrides(userId, dateFrom, dateTo);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDateOverride = async (req, res) => {
  try {
    const { date, slots } = req.body;
    // slots = [{ slot_index, is_available }, ...]
    await saveOverride(req.user.id, date, slots);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const instructorUserId = req.params.userId;
    if (!date || !instructorUserId)
      return res.status(400).json({ message: 'date and userId are required' });
    const slots = await getAvailableSlotsForDate(instructorUserId, date);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ביטול שיעור
export const cancelLesson = async (req, res) => {
  try {
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

    // בדיקת הרשאה
    const isStudent = role === 'student' && lesson.student_id === userId;
    const isInstructor = role === 'instructor' && lesson.instructor_user_id === userId;
    if (!isStudent && !isInstructor && role !== 'admin')
      return res.status(403).json({ message: 'אין הרשאה' });

    if (lesson.days_until >= 2 || role === 'admin') {
      await pool.query(`DELETE FROM driving_lessons WHERE id = ?`, [id]);
      return res.json({ success: true, cancelled: true });
    }

    // פחות מיומיים — צריך אישור הצד השני
    const requestedBy = role;
    const currentRequest = lesson.cancel_requested_by;

    if (currentRequest && currentRequest !== requestedBy) {
      await pool.query(`DELETE FROM driving_lessons WHERE id = ?`, [id]);
      return res.json({ success: true, cancelled: true });
    }

    // רישום הבקשה
    await pool.query(
      `UPDATE driving_lessons SET cancel_requested_by = ? WHERE id = ?`,
      [requestedBy, id]
    );
    res.json({ success: true, cancelled: false, message: 'בקשת הביטול נשלחה. השיעור יתבטל רק לאחר אישור הצד השני.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
