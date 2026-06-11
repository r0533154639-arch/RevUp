import {
  createStudentRequest, getStudentRequestStatus,
  getPendingRequestsForInstructor, getPendingRequestsCount,
  approveStudentRequest, rejectStudentRequest
} from '../dal/studentRequests.dal.js';

export const sendRequest = async (req, res) => {
  try {
    const { instructorUserId } = req.body;
    await createStudentRequest(req.user.id, instructorUserId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyRequestStatus = async (req, res) => {
  try {
    const data = await getStudentRequestStatus(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const data = await getPendingRequestsForInstructor(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingCount = async (req, res) => {
  try {
    const count = await getPendingRequestsCount(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const studentId = await approveStudentRequest(req.params.id, req.user.id);
    res.json({ success: true, studentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    await rejectStudentRequest(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
