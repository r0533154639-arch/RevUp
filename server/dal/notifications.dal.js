import pool from '../config/db.js';

export const getNotificationsSummary = async (userId, role) => {
  const items = [];

  if (role === 'instructor') {
    const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
    if (instr) {
      // שיעורים ממתינים לאישור
      const [[{ pendingLessons }]] = await pool.query(
        `SELECT COUNT(*) AS pendingLessons FROM driving_lessons dl JOIN lesson_statuses ls ON ls.id = dl.status_id WHERE dl.instructor_id = ? AND ls.name = 'pending'`,
        [instr.id]
      );
      if (pendingLessons > 0) items.push({ count: pendingLessons, tooltip: `${pendingLessons} שיעור${pendingLessons > 1 ? 'ים' : ''} ממתין${pendingLessons > 1 ? 'ים' : ''} לאישורך`, page: 'schedule' });

      // בקשות תלמידים חדשים
      const [[{ pendingStudents }]] = await pool.query(
        `SELECT COUNT(*) AS pendingStudents FROM instructor_student_requests WHERE instructor_id = ? AND status = 'pending'`,
        [instr.id]
      );
      if (pendingStudents > 0) items.push({ count: pendingStudents, tooltip: `${pendingStudents} תלמיד${pendingStudents > 1 ? 'ים' : ''} מבקש${pendingStudents > 1 ? 'ים' : ''} להצטרף אליך`, page: 'schedule' });

      // בקשות ביטול שיעור מתלמידים
      const [[{ cancelRequests }]] = await pool.query(
        `SELECT COUNT(*) AS cancelRequests FROM driving_lessons WHERE instructor_id = ? AND cancel_requested_by = 'student'`,
        [instr.id]
      ).catch(() => [[{ cancelRequests: 0 }]]);
      if (cancelRequests > 0) items.push({ count: cancelRequests, tooltip: `${cancelRequests} תלמיד${cancelRequests > 1 ? 'ים' : ''} ביקש${cancelRequests > 1 ? 'ו' : ''} לבטל שיעור`, page: 'schedule' });
    }
  }

  if (role === 'student') {
    // שיעורים שנדחו (cancelled_by = instructor)
    const [[{ rejectedLessons }]] = await pool.query(
      `SELECT COUNT(*) AS rejectedLessons FROM driving_lessons dl JOIN lesson_statuses ls ON ls.id = dl.status_id WHERE dl.student_id = ? AND ls.name = 'cancelled' AND dl.cancelled_by = 'instructor'`,
      [userId]
    ).catch(() => [[{ rejectedLessons: 0 }]]);
    if (rejectedLessons > 0) items.push({ count: rejectedLessons, tooltip: `${rejectedLessons} שיעור${rejectedLessons > 1 ? 'ים' : ''} נדח${rejectedLessons > 1 ? 'ו' : 'ה'} ע"י המורה`, page: 'schedule' });

    // בקשת הצטרפות למורה ממתינה
    const [[req]] = await pool.query(
      `SELECT status FROM instructor_student_requests WHERE student_id = ? AND status = 'pending'`,
      [userId]
    );
    if (req) items.push({ count: 1, tooltip: 'בקשתך למורה ממתינה לאישור', page: 'instructors' });

    // שיעורים ממתינים לאישור מורה
    const [[{ pendingLessons }]] = await pool.query(
      `SELECT COUNT(*) AS pendingLessons FROM driving_lessons dl JOIN lesson_statuses ls ON ls.id = dl.status_id WHERE dl.student_id = ? AND ls.name = 'pending'`,
      [userId]
    );
    if (pendingLessons > 0) items.push({ count: pendingLessons, tooltip: `${pendingLessons} שיעור${pendingLessons > 1 ? 'ים' : ''} ממתין${pendingLessons > 1 ? 'ים' : ''} לאישור המורה`, page: 'schedule' });
  }

  // קיבוץ לפי page
  const byPage = {};
  for (const item of items) {
    if (!byPage[item.page]) byPage[item.page] = { count: 0, tooltips: [] };
    byPage[item.page].count += item.count;
    byPage[item.page].tooltips.push(item.tooltip);
  }
  return byPage;
};
