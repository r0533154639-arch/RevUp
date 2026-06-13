import {
  createStudentRequest, getStudentRequestStatus,
  getPendingRequestsForInstructor, getPendingRequestsCount,
  approveStudentRequest, rejectStudentRequest
} from '../dal/studentRequests.dal.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const sendRequest = asyncHandler(async (req, res) => {
  const { instructorUserId } = req.body;
  await createStudentRequest(req.user.id, instructorUserId);
  res.json({ success: true });
});

export const getMyRequestStatus = asyncHandler(async (req, res) => {
  const data = await getStudentRequestStatus(req.user.id);
  res.json(data);
});

export const getPendingRequests = asyncHandler(async (req, res) => {
  const data = await getPendingRequestsForInstructor(req.user.id);
  res.json(data);
});

export const getPendingCount = asyncHandler(async (req, res) => {
  const count = await getPendingRequestsCount(req.user.id);
  res.json({ count });
});

export const approveRequest = asyncHandler(async (req, res) => {
  const studentId = await approveStudentRequest(req.params.id, req.user.id);
  res.json({ success: true, studentId });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  await rejectStudentRequest(req.params.id, req.user.id);
  res.json({ success: true });
});
