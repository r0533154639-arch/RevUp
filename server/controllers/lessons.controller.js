import { fetchLessons, bookLesson, approveLesson as approveLessonService, rejectLesson as rejectLessonService, dismissCancelledLesson, cancelLesson as cancelLessonService, rejectCancelRequest as rejectCancelService, fetchPendingCount, fetchNotifications } from '../services/lesson.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getLessons         = asyncHandler(async (req, res) => res.json(await fetchLessons(req.user.id, req.user.role)));
export const scheduleLesson     = asyncHandler(async (req, res) => res.status(201).json({ id: await bookLesson(req.user.id, req.body) }));
export const approveLesson      = asyncHandler(async (req, res) => { await approveLessonService(req.params.id, req.user.id); res.json({ success: true }); });
export const rejectLesson       = asyncHandler(async (req, res) => { await rejectLessonService(req.params.id, req.user.id); res.json({ success: true }); });
export const dismissLesson      = asyncHandler(async (req, res) => { await dismissCancelledLesson(req.params.id, req.user.id); res.json({ success: true }); });
export const cancelLesson       = asyncHandler(async (req, res) => res.json(await cancelLessonService(req.params.id, req.user.id, req.user.role)));
export const rejectCancel       = asyncHandler(async (req, res) => { await rejectCancelService(req.params.id, req.user.id, req.user.role); res.json({ success: true }); });
export const getPendingCount    = asyncHandler(async (req, res) => res.json({ count: await fetchPendingCount(req.user.id) }));
export const getMyNotifications = asyncHandler(async (req, res) => res.json(await fetchNotifications(req.user.id, req.user.role)));
export const submitFeedback     = asyncHandler(async (req, res) => { res.json({ success: true }); });
