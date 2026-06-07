import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const users = [
  { id: 1, password: 'Danny123!' },
  { id: 2, password: 'Rachel123!' },
  { id: 3, password: 'Student123!' },
  { id: 4, password: 'Student123!' },
  { id: 5, password: 'Student123!' },
  { id: 6, password: 'Student123!' },
  { id: 7, password: 'Student123!' },
];

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 10);
  await pool.query(
    'INSERT INTO passwords (user_id, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
    [u.id, hash, hash]
  );
  console.log(`✓ user ${u.id}`);
}

console.log('Done!');
pool.end();
