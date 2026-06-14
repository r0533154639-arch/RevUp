import { loginUser, registerUser, getUserProfile, updateUserProfile } from '../services/auth.service.js';
import pool from '../config/db.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body.email, req.body.password);
  res.json(data);
});

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json(data);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(await getUserProfile(req.user.id));
});

export const updateProfile = asyncHandler(async (req, res) => {
  res.json(await updateUserProfile(req.user.id, req.user.role, req.body, req.file));
});

export const getVehicleTypes = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name FROM vehicle_types');
  res.json(rows);
});
