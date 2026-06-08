import pool from '../config/db.js';

export const getAllInstructors = async ({ area } = {}) => {
  try {
    console.log('DAL: Getting instructors with area filter:', area);
    
    // שאילתה פשוטה יותר לבדיקה
    let query, params;
    
    if (area && area.trim()) {
      query = `SELECT di.id, di.area, u.name, u.phone, 
               COALESCE(u.profile_image, NULL) as profile_image
               FROM driving_instructor di
               JOIN users u ON u.id = di.user_id
               WHERE di.area LIKE ?`;
      params = [`%${area.trim()}%`];
    } else {
      query = `SELECT di.id, di.area, u.name, u.phone, 
               COALESCE(u.profile_image, NULL) as profile_image
               FROM driving_instructor di
               JOIN users u ON u.id = di.user_id`;
      params = [];
    }
    
    console.log('DAL: Executing query:', query, 'with params:', params);
    
    const [rows] = await pool.query(query, params);
    
    console.log('DAL: Found instructors:', rows.length);
    console.log('DAL: First instructor:', rows[0]);
    return rows;
  } catch (error) {
    console.error('DAL Error in getAllInstructors:', error);
    throw error;
  }
};

export const getInstructorSchedule = async (id) => {
  const [rows] = await pool.query('SELECT * FROM driving_lessons WHERE instructor_id = ?', [id]);
  return rows;
};

export const approveLessonById = async (id) => {
  await pool.query('UPDATE driving_lessons SET status = "approved" WHERE id = ?', [id]);
};

export const updateProfileImage = async (userId, filename) => {
  await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [filename, userId]);
};
