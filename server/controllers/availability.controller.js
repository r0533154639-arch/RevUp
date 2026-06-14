import { fetchTemplate, updateTemplate as updateTemplateService, fetchOverrides, saveOverrideForDate, fetchAvailableSlots } from '../services/availability.service.js';
import { cancelLesson as cancelLessonService, rejectCancelRequest as rejectCancelService } from '../services/lesson.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getTemplate       = asyncHandler(async (req, res) => res.json(await fetchTemplate(req.params.userId || req.user.id)));
export const updateTemplate    = asyncHandler(async (req, res) => res.json(await updateTemplateService(req.user.id, req.body.slots, req.body.forceCancel)));
export const getDateOverrides  = asyncHandler(async (req, res) => res.json(await fetchOverrides(req.params.userId || req.user.id, req.query.dateFrom, req.query.dateTo)));
export const updateDateOverride= asyncHandler(async (req, res) => { await saveOverrideForDate(req.user.id, req.body.date, req.body.slots); res.json({ success: true }); });
export const getAvailableSlots = asyncHandler(async (req, res) => res.json(await fetchAvailableSlots(req.params.userId, req.query.date)));
export const cancelLesson      = asyncHandler(async (req, res) => res.json(await cancelLessonService(req.params.id, req.user.id, req.user.role)));
export const rejectCancelRequest = asyncHandler(async (req, res) => { await rejectCancelService(req.params.id, req.user.id, req.user.role); res.json({ success: true }); });
