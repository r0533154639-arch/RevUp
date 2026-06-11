import { findUserByEmail, createUser, findUserById, updateProfileImage } from '../dal/students.dal.js';
import { sendWelcomeEmail } from '../services/mailer.js';
import { getInstructorProfileStatus } from '../dal/instructors.dal.js';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (user.is_blocked)
      return res.status(403).json({ message: 'חשבונך נחסם. צור קשר עם המנהל.' });
    
    let profile_status = null;
    if (user.role === 'instructor')
      profile_status = await getInstructorProfileStatus(user.id);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, profile_image: user.profile_image, profile_status, instructor_user_id: user.instructor_user_id ?? null }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, date_of_birth, status, vehicle_type_id } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = await createUser({ name, email, phone, password: hashed, role, date_of_birth, status, vehicle_type_id });
    const profile_status = role === 'instructor' ? 'draft' : null;
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    sendWelcomeEmail(email, name).catch(console.error);
    res.status(201).json({
      token,
      user: { id, name, role, profile_image: null, profile_status, instructor_user_id: null }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const response = {
      id: user.id,
      name: user.name,
      role: user.role,
      profile_image: user.profile_image,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
    };
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
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { phone, date_of_birth, area, vehicle_types } = req.body;
    const fields = [];
    const values = [];
    if (phone)         { fields.push('phone = ?');         values.push(phone); }
    if (date_of_birth) { fields.push('date_of_birth = ?'); values.push(date_of_birth); }
    if (fields.length) {
      values.push(req.user.id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    if (req.file) await updateProfileImage(req.user.id, req.file.filename);

    if (req.user.role === 'instructor') {
      if (area !== undefined) {
        await pool.query('UPDATE driving_instructor SET area = ? WHERE user_id = ?', [area, req.user.id]);
      }
      if (vehicle_types !== undefined) {
        const vtIds = typeof vehicle_types === 'string' ? JSON.parse(vehicle_types) : vehicle_types;
        const [[instr]] = await pool.query('SELECT id FROM driving_instructor WHERE user_id = ?', [req.user.id]);
        if (instr) {
          await pool.query('DELETE FROM instructor_vehicle_types WHERE instructor_id = ?', [instr.id]);
          if (vtIds.length) {
            const vals = vtIds.map(id => [instr.id, id]);
            await pool.query('INSERT INTO instructor_vehicle_types (instructor_id, vehicle_type_id) VALUES ?', [vals]);
          }
        }
      }
    }

    const user = await findUserById(req.user.id);
    const response = { id: user.id, name: user.name, role: user.role, profile_image: user.profile_image, phone: user.phone, date_of_birth: user.date_of_birth };
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
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVehicleTypes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM vehicle_types');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

