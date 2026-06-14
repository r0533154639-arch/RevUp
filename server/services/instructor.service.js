import { getAllInstructors, completeInstructorProfile, getInstructorProfileStatus, updateProfileImage } from '../dal/instructors.dal.js';

export const fetchInstructors = ({ areas, vehicle_types, min_rating } = {}) =>
  getAllInstructors({ areas, vehicle_types, min_rating });

export const completeProfile = async (userId, { area, vehicle_types, years_experience }) => {
  if (!area) throw Object.assign(new Error('אזור לימוד הוא שדה חובה'), { status: 400 });
  await completeInstructorProfile(userId, { area, vehicle_types, years_experience });
  return getInstructorProfileStatus(userId);
};

export const uploadInstructorPhoto = async (userId, file) => {
  if (!file) throw Object.assign(new Error('No file uploaded'), { status: 400 });
  await updateProfileImage(userId, file.filename);
  return file.filename;
};
