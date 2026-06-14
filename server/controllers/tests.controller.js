import { fetchTests, addTest, addAppeal, getTestPhase, requestTest as requestTestService, fetchTestRequestsForInstructor, scheduleTestByInstructor as scheduleTestService } from '../services/test.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getTests                 = asyncHandler(async (req, res) => res.json(await fetchTests(req.user.id)));
export const scheduleTest             = asyncHandler(async (req, res) => res.status(201).json({ id: await addTest({ ...req.body, studentId: req.user.id }) }));
export const submitAppeal             = asyncHandler(async (req, res) => { await addAppeal(req.params.id, req.body); res.json({ success: true }); });
export const getTestStatus            = asyncHandler(async (req, res) => res.json(await getTestPhase(req.user.id)));
export const requestTest              = asyncHandler(async (req, res) => { await requestTestService(req.user.id); res.json({ success: true }); });
export const getMyTestRequests        = asyncHandler(async (req, res) => res.json(await fetchTestRequestsForInstructor(req.user.id)));
export const scheduleTestByInstructor = asyncHandler(async (req, res) => res.json({ success: true, testId: await scheduleTestService(req.body) }));
