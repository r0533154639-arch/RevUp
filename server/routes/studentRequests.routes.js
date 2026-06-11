import { Router } from 'express';
import { sendRequest, getMyRequestStatus, getPendingRequests, getPendingCount, approveRequest, rejectRequest } from '../controllers/studentRequests.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', verifyToken, checkRole(['student']), sendRequest);
router.get('/my-status', verifyToken, checkRole(['student']), getMyRequestStatus);
router.get('/pending', verifyToken, checkRole(['instructor']), getPendingRequests);
router.get('/pending-count', verifyToken, checkRole(['instructor']), getPendingCount);
router.put('/:id/approve', verifyToken, checkRole(['instructor']), approveRequest);
router.put('/:id/reject', verifyToken, checkRole(['instructor']), rejectRequest);
export default router;
