import { findUserByEmail, createUser, findUserById, updateProfileImage } from '../dal/students.dal.js';
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
      user: { id: user.id, name: user.name, role: user.role, profile_image: user.profile_image, profile_status }
    });
  } catch (err) {
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
    res.status(201).json({
      token,
      user: { id, name, role, profile_image: null, profile_status }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let profile_status = null;
    if (user.role === 'instructor')
      profile_status = await getInstructorProfileStatus(user.id);
    res.json({ id: user.id, name: user.name, role: user.role, profile_image: user.profile_image, profile_status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { phone, date_of_birth, area } = req.body;
    const fields = [];
    const values = [];
    if (phone)         { fields.push('phone = ?');         values.push(phone); }
    if (date_of_birth) { fields.push('date_of_birth = ?'); values.push(date_of_birth); }
    if (area)          { fields.push('area = ?');          values.push(area); }
    if (fields.length) {
      values.push(req.user.id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    if (req.file) await updateProfileImage(req.user.id, req.file.filename);
    const user = await findUserById(req.user.id);
    res.json({ id: user.id, name: user.name, role: user.role, profile_image: user.profile_image, phone: user.phone, date_of_birth: user.date_of_birth, area: user.area });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

