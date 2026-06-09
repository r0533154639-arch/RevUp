import pool from '../config/db.js';

export const getDashboard = async (req, res) => {
  try {
    const [[{ total_users, total_students, total_instructors }]] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        SUM(role = 'student') AS total_students,
        SUM(role = 'instructor') AS total_instructors
      FROM users
    `);

    const [students] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image, u.is_blocked,
             ds.status, vt.name AS vehicle_type,
             ui.name AS instructor_name
      FROM users u
      JOIN driving_students ds ON ds.user_id = u.id
      LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
      LEFT JOIN driving_instructor di ON di.id = ds.instructor_id
      LEFT JOIN users ui ON ui.id = di.user_id
      WHERE u.role = 'student'
      ORDER BY u.name
    `);

    const [instructors] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.profile_image, u.is_blocked,
             di.area,
             COUNT(DISTINCT ds.user_id) AS student_count
      FROM users u
      JOIN driving_instructor di ON di.user_id = u.id
      LEFT JOIN driving_students ds ON ds.instructor_id = di.id
      WHERE u.role = 'instructor'
      GROUP BY u.id
      ORDER BY u.name
    `);

    const [posts] = await pool.query(`
      SELECT p.id, p.title, p.content, p.created_at,
             u.id AS author_id, u.name AS author_name, u.profile_image AS author_image
      FROM posts p
      JOIN users u ON u.id = p.instructor_id
      ORDER BY p.created_at DESC
    `);

    const [comments] = await pool.query(`
      SELECT pc.id, pc.content, pc.created_at, pc.post_id, pc.parent_comment_id,
             u.id AS author_id, u.name AS author_name,
             p.title AS post_title
      FROM post_comments pc
      JOIN users u ON u.id = pc.user_id
      JOIN posts p ON p.id = pc.post_id
      ORDER BY pc.created_at DESC
    `);

    const [lessons] = await pool.query(`
      SELECT dl.id, dl.date, dl.time, dl.status,
             us.name AS student_name, us.id AS student_id,
             ui.name AS instructor_name, ui.id AS instructor_id,
             vt.name AS vehicle_type
      FROM driving_lessons dl
      JOIN users us ON us.id = dl.student_id
      JOIN driving_instructor di ON di.id = dl.instructor_id
      JOIN users ui ON ui.id = di.user_id
      LEFT JOIN driving_students ds ON ds.user_id = dl.student_id
      LEFT JOIN vehicle_types vt ON vt.id = ds.vehicle_type_id
      ORDER BY dl.date DESC, dl.time DESC
    `);

    const [feedbacks] = await pool.query(`
      SELECT lf.id, lf.progress_rating, lf.notes, lf.created_at,
             us.name AS student_name, ui.name AS instructor_name,
             dl.date AS lesson_date
      FROM lesson_feedback lf
      JOIN driving_lessons dl ON dl.id = lf.lesson_id
      JOIN users us ON us.id = lf.student_id
      JOIN driving_instructor di ON di.id = lf.instructor_id
      JOIN users ui ON ui.id = di.user_id
      ORDER BY lf.created_at DESC
    `);

    res.json({ total_users, total_students, total_instructors, students, instructors, posts, comments, lessons, feedbacks });
  } catch (err) {
    console.error('admin dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;
    await pool.query('UPDATE users SET is_blocked = ? WHERE id = ?', [block ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
