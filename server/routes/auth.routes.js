import { Router } from 'express';
import { login, register, getMe, updateProfile, getVehicleTypes } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, upload.single('profile_image'), updateProfile);
router.get('/vehicle-types', getVehicleTypes);

export default router;
