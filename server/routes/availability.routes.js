import { Router } from 'express';
import {
  getTemplate, updateTemplate,
  getDateOverrides, updateDateOverride,
  getAvailableSlots, cancelLesson, rejectCancelRequest
} from '../controllers/availability.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';

const router = Router();

// תבנית שבועית - המורה עצמו
router.get('/template', verifyToken, checkRole(['instructor']), getTemplate);
router.put('/template', verifyToken, checkRole(['instructor']), updateTemplate);

// overrides לתאריך ספציפי
router.get('/overrides', verifyToken, checkRole(['instructor']), getDateOverrides);
router.put('/override', verifyToken, checkRole(['instructor']), updateDateOverride);

// slots פנויים למורה ספציפי (לתלמיד/אדמין/פרופיל)
router.get('/:userId/slots', verifyToken, getAvailableSlots);

// תבנית שבועית לצפייה (לפרופיל מורה)
router.get('/:userId/template', verifyToken, getTemplate);

// ביטול שיעור
router.put('/lessons/:id/cancel', verifyToken, cancelLesson);
router.put('/lessons/:id/reject-cancel', verifyToken, rejectCancelRequest);

export default router;
