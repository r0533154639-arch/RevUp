import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getNotificationsSummary } from '../dal/notifications.dal.js';

const router = Router();

router.get('/summary', verifyToken, async (req, res) => {
  try {
    const data = await getNotificationsSummary(req.user.id, req.user.role);
    console.log('notifications summary for', req.user.id, req.user.role, ':', JSON.stringify(data));
    res.json(data);
  } catch (err) {
    console.error('notifications summary error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
