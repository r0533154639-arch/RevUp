import pool from '../config/db.js';

export const getAllStudents = async () => {
  try {
    // ננסה קודם עם העמודה is_blocked
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.is_blocked, ds.status 
       FROM users u 
       LEFT JOIN driving_students ds ON u.id = ds.user_id 
       WHERE u.role = 'student'`
    );
    return rows;
  } catch (error) {
    // אם העמודה לא קיימת, נחזיר בלי העמודה
    console.log('Column is_blocked not found, using fallback query');
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, FALSE as is_blocked, ds.status 
       FROM users u 
       LEFT JOIN driving_students ds ON u.id = ds.user_id 
       WHERE u.role = 'student'`
    );
    return rows;
  }
};

export const updateStudentStatus = async (studentId, status) => {
  await pool.execute(
    'UPDATE driving_students SET status = ? WHERE user_id = ?',
    [status, studentId]
  );
};

export const toggleUserBlock = async (userId, isBlocked) => {
  try {
    console.log('DAL: Updating user block status:', userId, 'to:', isBlocked);
    
    // ננסה קודם לעדכן את העמודה is_blocked
    const result = await pool.execute(
      'UPDATE users SET is_blocked = ? WHERE id = ?',
      [isBlocked, userId]
    );
    console.log('DAL: Update result:', result);
    return result;
  } catch (error) {
    // אם העמודה לא קיימת, נוסיף אותה
    if (error.message.includes('Unknown column')) {
      console.log('Adding is_blocked column to users table');
      await pool.execute('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE');
      // ננסה שוב
      const result = await pool.execute(
        'UPDATE users SET is_blocked = ? WHERE id = ?',
        [isBlocked, userId]
      );
      return result;
    } else {
      console.error('DAL Error in toggleUserBlock:', error);
      throw error;
    }
  }
};

export const getAllInstructors = async () => {
  try {
    // ננסה קודם עם העמודה is_blocked
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.is_blocked, di.area 
       FROM users u 
       JOIN driving_instructor di ON u.id = di.user_id 
       WHERE u.role = 'instructor'`
    );
    return rows;
  } catch (error) {
    // אם העמודה לא קיימת, נחזיר בלי העמודה
    console.log('Column is_blocked not found, using fallback query');
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, FALSE as is_blocked, di.area 
       FROM users u 
       JOIN driving_instructor di ON u.id = di.user_id 
       WHERE u.role = 'instructor'`
    );
    return rows;
  }
};

export const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT id, name, email, role, is_blocked, created_at 
     FROM users 
     WHERE role != 'admin'
     ORDER BY created_at DESC`
  );
  return rows;
};

export const getInstructorAchievements = async (instructorId) => {
  const [totalStudents] = await pool.execute(
    'SELECT COUNT(*) as count FROM driving_students WHERE instructor_id = ?',
    [instructorId]
  );
  
  const [passedStudents] = await pool.execute(
    'SELECT COUNT(*) as count FROM driving_students WHERE instructor_id = ? AND status = "licensed"',
    [instructorId]
  );
  
  const [totalLessons] = await pool.execute(
    'SELECT COUNT(*) as count FROM driving_lessons WHERE instructor_id = ? AND status = "completed"',
    [instructorId]
  );
  
  const [avgRating] = await pool.execute(
    `SELECT AVG(ir.rating) as avg_rating 
     FROM instructor_review ir 
     JOIN driving_instructor di ON ir.instructor_id = di.id 
     WHERE di.user_id = ?`,
    [instructorId]
  );
  
  return {
    totalStudents: totalStudents[0].count,
    passedStudents: passedStudents[0].count,
    totalLessons: totalLessons[0].count,
    averageRating: avgRating[0].avg_rating || 0
  };
};

export const getAllPosts = async () => {
  const [rows] = await pool.execute(
    `SELECT p.id, p.title, p.content, p.created_at, u.name as instructor_name 
     FROM posts p 
     JOIN users u ON p.instructor_id = u.id 
     ORDER BY p.created_at DESC`
  );
  return rows;
};

export const getAllComments = async () => {
  const [rows] = await pool.execute(
    `SELECT f.id, f.rating, f.comment, dl.date as lesson_date,
            us.name as student_name, ui.name as instructor_name
     FROM feedback f
     JOIN driving_lessons dl ON f.lesson_id = dl.id
     JOIN users us ON dl.student_id = us.id
     JOIN driving_instructor di ON dl.instructor_id = di.id
     JOIN users ui ON di.user_id = ui.id
     ORDER BY dl.date DESC`
  );
  return rows;
};