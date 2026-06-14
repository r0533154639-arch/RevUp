import { getDashboardData, setUserBlock, editCell, changeStudentStatus, processTestResult, getAllStudents, getAllInstructors, getInstructorAchievements, getAllPosts, getAllComments, getAllUsers, getPendingInstructors, approveInstructor } from '../services/admin.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getDashboard             = asyncHandler(async (req, res) => res.json(await getDashboardData()));
export const blockUser                = asyncHandler(async (req, res) => { await setUserBlock(req.params.id || req.params.userId, req.body.block ?? req.body.isBlocked); res.json({ success: true }); });
export const updateCell               = asyncHandler(async (req, res) => { await editCell(req.params.table, req.params.id, req.body.field, req.body.value); res.json({ success: true }); });
export const getUsers                 = asyncHandler(async (req, res) => res.json(await getAllUsers()));
export const getStudents              = asyncHandler(async (req, res) => res.json(await getAllStudents()));
export const updateStatus             = asyncHandler(async (req, res) => { await changeStudentStatus(req.params.studentId, req.body.status); res.json({ success: true }); });
export const updateTestResult         = asyncHandler(async (req, res) => { await processTestResult(req.params.studentId, req.body.result); res.json({ success: true }); });
export const getInstructors           = asyncHandler(async (req, res) => res.json(await getAllInstructors()));
export const getAchievements          = asyncHandler(async (req, res) => res.json(await getInstructorAchievements(req.params.instructorId)));
export const getPosts                 = asyncHandler(async (req, res) => res.json(await getAllPosts()));
export const getComments              = asyncHandler(async (req, res) => res.json(await getAllComments()));
export const getPendingInstructorsList= asyncHandler(async (req, res) => res.json(await getPendingInstructors()));
export const approveInstructorById    = asyncHandler(async (req, res) => { await approveInstructor(req.params.userId); res.json({ success: true }); });
