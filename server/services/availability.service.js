import { getWeeklyTemplate, saveWeeklyTemplate, getOverrides, saveOverride, getAvailableSlotsForDate, getLessonsConflictingWithTemplate, cancelConflictingLessons } from '../dal/availability.dal.js';

export const fetchTemplate = async (userId) => {
  const rows = await getWeeklyTemplate(userId);
  const template = {};
  for (const r of rows) {
    if (!template[r.day_of_week]) template[r.day_of_week] = [];
    template[r.day_of_week].push(r.slot_index);
  }
  return template;
};

export const updateTemplate = async (userId, slots, forceCancel) => {
  const conflicts = await getLessonsConflictingWithTemplate(userId, slots);
  if (!forceCancel && conflicts.length > 0)
    return { requiresConfirmation: true, conflicts };
  if (forceCancel && conflicts.length > 0)
    await cancelConflictingLessons(conflicts.map(c => c.id));
  await saveWeeklyTemplate(userId, slots);
  return { success: true };
};

export const fetchOverrides      = (userId, dateFrom, dateTo) => getOverrides(userId, dateFrom, dateTo);
export const saveOverrideForDate = (userId, date, slots)      => saveOverride(userId, date, slots);

export const fetchAvailableSlots = (instructorUserId, date) => {
  if (!date || !instructorUserId)
    throw Object.assign(new Error('date and userId are required'), { status: 400 });
  return getAvailableSlotsForDate(instructorUserId, date);
};
