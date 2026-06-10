import pool from '../config/db.js';

// slot_index → "HH:MM"
export const slotToTime = (slot) => {
  const totalMinutes = slot * 45;
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

// "HH:MM" → slot_index (מחזיר null אם לא מיושר)
export const timeToSlot = (time) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m;
  return total % 45 === 0 ? total / 45 : null;
};

// קבלת תבנית שבועית של מורה (לפי user_id)
export const getWeeklyTemplate = async (userId) => {
  const [rows] = await pool.query(
    `SELECT iwt.day_of_week, iwt.slot_index
     FROM instructor_weekly_template iwt
     JOIN driving_instructor di ON di.id = iwt.instructor_id
     WHERE di.user_id = ?
     ORDER BY iwt.day_of_week, iwt.slot_index`,
    [userId]
  );
  return rows;
};

// שמירת תבנית שבועית (מחליף הכל)
export const saveWeeklyTemplate = async (userId, slots) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[instr]] = await conn.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
    if (!instr) throw new Error('Instructor not found');
    await conn.query('DELETE FROM instructor_weekly_template WHERE instructor_id = ?', [instr.id]);
    if (slots.length > 0) {
      const values = slots.map(({ day_of_week, slot_index }) => [instr.id, day_of_week, slot_index]);
      await conn.query('INSERT INTO instructor_weekly_template (instructor_id, day_of_week, slot_index) VALUES ?', [values]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// קבלת overrides לתאריך ספציפי או טווח
export const getOverrides = async (userId, dateFrom, dateTo) => {
  const [rows] = await pool.query(
    `SELECT iao.date, iao.slot_index, iao.is_available
     FROM instructor_availability_override iao
     JOIN driving_instructor di ON di.id = iao.instructor_id
     WHERE di.user_id = ? AND iao.date BETWEEN ? AND ?
     ORDER BY iao.date, iao.slot_index`,
    [userId, dateFrom, dateTo]
  );
  return rows;
};

// שמירת override לתאריך ספציפי (מחליף את כל ה-overrides של אותו תאריך)
export const saveOverride = async (userId, date, slots) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[instr]] = await conn.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
    await conn.query(
      'DELETE FROM instructor_availability_override WHERE instructor_id = ? AND date = ?',
      [instr.id, date]
    );
    if (slots.length > 0) {
      const values = slots.map(({ slot_index, is_available }) => [instr.id, date, slot_index, is_available]);
      await conn.query(
        'INSERT INTO instructor_availability_override (instructor_id, date, slot_index, is_available) VALUES ?',
        [values]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// slots פנויים למורה ביום ספציפי (תבנית + overrides - שיעורים שכבר נקבעו)
export const getAvailableSlotsForDate = async (instructorUserId, date) => {
  const dayOfWeek = new Date(date).getDay(); // 0=Sunday

  // תבנית שבועית
  const [templateRows] = await pool.query(
    `SELECT iwt.slot_index
     FROM instructor_weekly_template iwt
     JOIN driving_instructor di ON di.id = iwt.instructor_id
     WHERE di.user_id = ? AND iwt.day_of_week = ?`,
    [instructorUserId, dayOfWeek]
  );
  let availableSlots = new Set(templateRows.map(r => r.slot_index));

  // overrides לאותו תאריך
  const [overrides] = await pool.query(
    `SELECT iao.slot_index, iao.is_available
     FROM instructor_availability_override iao
     JOIN driving_instructor di ON di.id = iao.instructor_id
     WHERE di.user_id = ? AND iao.date = ?`,
    [instructorUserId, date]
  );
  for (const o of overrides) {
    if (o.is_available) availableSlots.add(o.slot_index);
    else availableSlots.delete(o.slot_index);
  }

  // הסרת slots שכבר נקבעו
  const [bookedRows] = await pool.query(
    `SELECT dl.time
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     WHERE di.user_id = ? AND dl.date = ? AND dl.status NOT IN ('cancelled')`,
    [instructorUserId, date]
  );
  for (const b of bookedRows) {
    const slot = timeToSlot(b.time.slice(0, 5));
    if (slot !== null) availableSlots.delete(slot);
  }

  return [...availableSlots].sort((a, b) => a - b).map(slot => ({
    slot_index: slot,
    time: slotToTime(slot),
  }));
};

// בדיקה: כמה שיעורים קיימים שיתבטלו אם התבנית תשתנה
export const getLessonsConflictingWithTemplate = async (userId, newSlots) => {
  const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
  if (!instr) return [];

  const newSlotTimes = newSlots.map(s => slotToTime(s.slot_index));

  const [lessons] = await pool.query(
    `SELECT dl.id, dl.date, dl.time, u.name AS student_name
     FROM driving_lessons dl
     JOIN driving_instructor di ON di.id = dl.instructor_id
     JOIN users u ON u.id = dl.student_id
     WHERE di.user_id = ? AND dl.date >= CURDATE() AND dl.status NOT IN ('cancelled','completed')`,
    [userId]
  );

  return lessons.filter(l => {
    const dayOfWeek = new Date(l.date).getDay();
    const time = l.time.slice(0, 5);
    const matchesTemplate = newSlots.some(
      s => s.day_of_week === dayOfWeek && slotToTime(s.slot_index) === time
    );
    return !matchesTemplate;
  });
};

// ביטול שיעורים שאינם תואמים לתבנית החדשה
export const cancelConflictingLessons = async (lessonIds) => {
  if (!lessonIds.length) return;
  await pool.query(
    `UPDATE driving_lessons SET status = 'cancelled', cancelled_by = 'instructor'
     WHERE id IN (?)`,
    [lessonIds]
  );
};
