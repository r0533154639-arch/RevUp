import { insertLog, queryLogs } from '../dal/auditLog.dal.js';
import logger from '../middleware/logger.js';

export const audit = (data) => {
  insertLog(data).catch(err =>
    logger.warn('Audit log failed', { message: err.message, data })
  );
};

export const getAuditLogs = (filters) => queryLogs(filters);

export const auditUserRegistered  = (userId, name, role, ip) =>
  audit({ user_id: userId, action: 'USER_REGISTERED', entity_type: 'user', entity_id: userId, details: { name, role }, ip });

export const auditUserLogin       = (userId, ip) =>
  audit({ user_id: userId, action: 'USER_LOGIN', entity_type: 'user', entity_id: userId, ip });

export const auditLoginFailed     = (email, ip) =>
  audit({ user_id: null, action: 'LOGIN_FAILED', entity_type: 'user', details: { email }, ip });

export const auditProfileUpdated  = (userId, fields, ip) =>
  audit({ user_id: userId, action: 'PROFILE_UPDATED', entity_type: 'user', entity_id: userId, details: { fields }, ip });

export const auditLessonCreated   = (userId, lessonId, details, ip) =>
  audit({ user_id: userId, action: 'LESSON_CREATED', entity_type: 'lesson', entity_id: lessonId, details, ip });

export const auditLessonApproved  = (userId, lessonId, ip) =>
  audit({ user_id: userId, action: 'LESSON_APPROVED', entity_type: 'lesson', entity_id: lessonId, ip });

export const auditLessonRejected  = (userId, lessonId, ip) =>
  audit({ user_id: userId, action: 'LESSON_REJECTED', entity_type: 'lesson', entity_id: lessonId, ip });

export const auditLessonCancelled = (userId, lessonId, role, ip) =>
  audit({ user_id: userId, action: 'LESSON_CANCELLED', entity_type: 'lesson', entity_id: lessonId, details: { by: role }, ip });

export const auditInstructorApproved = (adminId, instructorUserId, ip) =>
  audit({ user_id: adminId, action: 'INSTRUCTOR_APPROVED', entity_type: 'instructor', entity_id: instructorUserId, ip });

export const auditAdminAction     = (adminId, action, entityType, entityId, details, ip) =>
  audit({ user_id: adminId, action: `ADMIN_${action.toUpperCase()}`, entity_type: entityType, entity_id: entityId, details, ip });
