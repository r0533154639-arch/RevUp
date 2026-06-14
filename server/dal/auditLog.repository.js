import pool from '../config/db.js';

export const insertLog = async ({ user_id, action, entity_type, entity_id, details, ip }) => {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id ?? null, action, entity_type ?? null, entity_id ?? null,
     details ? JSON.stringify(details) : null, ip ?? null]
  );
};

export const queryLogs = async ({ user_id, action, from, to, limit = 100, offset = 0 }) => {
  const conditions = [];
  const params = [];

  if (user_id)  { conditions.push('user_id = ?');       params.push(user_id); }
  if (action)   { conditions.push('action LIKE ?');     params.push(`%${action}%`); }
  if (from)     { conditions.push('created_at >= ?');   params.push(from); }
  if (to)       { conditions.push('created_at <= ?');   params.push(to); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT al.*, u.name AS user_name, u.email AS user_email
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM audit_logs ${where}`,
    params
  );
  return { rows, total };
};
