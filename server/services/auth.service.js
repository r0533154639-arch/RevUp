import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { findUserByEmail, createUser, findUserById, updateProfileImage } from '../dal/students.dal.js';
import { getInstructorProfileStatus } from '../dal/instructors.dal.js';
import { sendWelcomeEmail } from '../utils/mailer.js';
import { auditUserRegistered, auditUserLogin, auditLoginFailed, auditProfileUpdated } from './auditLog.service.js';

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    auditLoginFailed(email, null);
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }
  if (user.is_blocked)
    throw Object.assign(new Error('חשבונך נחסם. צור קשר עם המנהל.'), { status: 403 });

  let profile_status = null;
  if (user.role === 'instructor')
    profile_status = await getInstructorProfileStatus(user.id);

  let vehicle_type_name = null;
  if (user.role === 'student') {
    const [[vtRow]] = await pool.query(
      `SELECT vt.name FROM vehicle_types vt JOIN driving_students ds ON ds.vehicle_type_id = vt.id WHERE ds.user_id = ?`,
      [user.id]
    );
    vehicle_type_name = vtRow?.name || null;
  }

  auditUserLogin(user.id, null);
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return {
    token,
    user: { id: user.id, name: user.name, role: user.role, profile_image: user.profile_image, profile_status, status: user.status ?? null, vehicle_type_name, instructor_user_id: user.instructor_user_id ?? null }
  };
};

export const registerUser = async ({ name, email, phone, password, role, date_of_birth, status, vehicle_type_id }) => {
  const hashed = await bcrypt.hash(password, 10);
  const id = await createUser({ name, email, phone, password: hashed, role, date_of_birth, status, vehicle_type_id });
  const profile_status = role === 'instructor' ? 'draft' : null;
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  sendWelcomeEmail(email, name).catch(console.error);
  auditUserRegistered(id, name, role, null);
  return { token, user: { id, name, role, profile_image: null, profile_status, instructor_user_id: null } };
};

export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const response = {
    id: user.id, name: user.name, role: user.role,
    profile_image: user.profile_image, phone: user.phone,
    date_of_birth: user.date_of_birth, status: user.status ?? null,
  };

  if (user.role === 'student') {
    const [[vtRow]] = await pool.query(
      `SELECT vt.name FROM vehicle_types vt JOIN driving_students ds ON ds.vehicle_type_id = vt.id WHERE ds.user_id = ?`,
      [user.id]
    );
    response.vehicle_type_name = vtRow?.name || null;
  }

  if (user.role === 'instructor') {
    const [instrRows] = await pool.query('SELECT area FROM driving_instructor WHERE user_id = ?', [user.id]);
    response.area = instrRows[0]?.area || '';
    const [vtRows] = await pool.query(
      `SELECT vt.id FROM vehicle_types vt
       JOIN instructor_vehicle_types ivt ON ivt.vehicle_type_id = vt.id
       JOIN driving_instructor di ON di.id = ivt.instructor_id
       WHERE di.user_id = ?`,
      [user.id]
    );
    response.vehicle_types = vtRows.map(r => r.id);
  }
  return response;
};

export const updateUserProfile = async (userId, role, { phone, date_of_birth, area, vehicle_types }, file) => {
  const fields = [];
  const values = [];
  if (phone)         { fields.push('phone = ?');         values.push(phone); }
  if (date_of_birth) { fields.push('date_of_birth = ?'); values.push(date_of_birth); }
  if (fields.length) {
    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  if (file) await updateProfileImage(userId, file.filename);

  auditProfileUpdated(userId, { phone, date_of_birth, area, vehicle_types: vehicle_types !== undefined }, null);

  if (role === 'instructor') {
    if (area !== undefined)
      await pool.query('UPDATE driving_instructor SET area = ? WHERE user_id = ?', [area, userId]);
    if (vehicle_types !== undefined) {
      const vtIds = typeof vehicle_types === 'string' ? JSON.parse(vehicle_types) : vehicle_types;
      const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [userId]);
      if (instr) {
        await pool.query('DELETE FROM instructor_vehicle_types WHERE instructor_id = ?', [instr.id]);
        if (vtIds.length) {
          await pool.query('INSERT INTO instructor_vehicle_types (instructor_id, vehicle_type_id) VALUES ?', [vtIds.map(id => [instr.id, id])]);
        }
      }
    }
  }
  return getUserProfile(userId);
};
