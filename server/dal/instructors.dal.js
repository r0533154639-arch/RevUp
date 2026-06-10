import pool from '../config/db.js';

export const getAllInstructors = async ({ areas, vehicle_types, min_rating } = {}) => {
  const REGION_CITIES = {
    north:     ['חיפה','נצרת','עכו','כרמיאל','טבריה','צפת','קריות','נהריה','יוקנעם','עפולה','בית שאן','מגדל העמק','שפרעם','אום אל פחם'],
    center:    ['תל אביב','רמת גן','פתח תקווה','ראשון לציון','נתניה','חולון','בת ים','גבעתיים','בני ברק','הרצליה','רעננה','כפר סבא','רמת השרון','אור יהודה','לוד','רמלה','מודיעין','אזור','יהוד','קריית אונו','גבעת שמואל','ראש העין'],
    jerusalem: ['ירושלים','בית שמש','מעלה אדומים','מודיעין עילית','ביתר עילית','אבו גוש','קריית יערים'],
    south:     ['באר שבע','אשדוד','אשקלון','רהט','דימונה','קריית גת','נתיבות','שדרות','ערד','אילת','אופקים','נצרת עילית'],
    sharon:    ['נתניה','רעננה','כפר סבא','הוד השרון','רמת השרון','הרצליה','רא"ש העין','טייבה','קלנסווה'],
  };

  const conditions = [];
  const params = [];

  if (areas?.length) {
    const cities = areas.flatMap(a => REGION_CITIES[a] || []);
    if (cities.length) {
      conditions.push(`(${cities.map(() => 'di.area LIKE ?').join(' OR ')})`);
      cities.forEach(c => params.push(`%${c}%`));
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT di.id, di.area, u.name, u.phone, COALESCE(u.profile_image, NULL) AS profile_image,
            ROUND(AVG(ir.rating), 1) AS avg_rating, COUNT(DISTINCT ir.id) AS review_count,
            GROUP_CONCAT(DISTINCT vt.name ORDER BY vt.name SEPARATOR ', ') AS vehicle_types
     FROM driving_instructor di
     JOIN users u ON u.id = di.user_id
     LEFT JOIN instructor_review ir ON ir.instructor_id = di.id
     LEFT JOIN instructor_vehicle_types ivt ON ivt.instructor_id = di.id
     LEFT JOIN vehicle_types vt ON vt.id = ivt.vehicle_type_id
     ${whereClause}
     GROUP BY di.id, di.area, u.name, u.phone, u.profile_image`,
    params
  );

  let result = rows;
  if (vehicle_types?.length) {
    result = result.filter(r => vehicle_types.some(vt => r.vehicle_types?.includes(vt)));
  }
  if (min_rating) {
    result = result.filter(r => r.avg_rating != null && r.avg_rating >= parseFloat(min_rating));
  }
  return result;
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
