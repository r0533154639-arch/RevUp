import { getAuditLogs } from '../services/auditLog.service.js';
import { asyncHandler } from '../utils/controllerFactory.js';

export const getLogs = asyncHandler(async (req, res) => {
  const { user_id, action, from, to, limit, offset } = req.query;
  const result = await getAuditLogs({ user_id, action, from, to, limit, offset });
  res.json(result);
});
