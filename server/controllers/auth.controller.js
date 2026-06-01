import { findUserByEmail, createUser } from '../dal/students.dal.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, date_of_birth, status, area, vehicle_types } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = await createUser({ name, email, phone, password: hashed, role, date_of_birth, status, area, vehicle_types });
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};
