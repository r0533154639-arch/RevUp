import { getStudentProgress, setStudentStatus, updateProfileImage } from '../dal/students.dal.js';

export const getProgress = async (req, res) => {
  const data = await getStudentProgress(req.user.id);
  res.json(data);
};

export const updateStatus = async (req, res) => {
  await setStudentStatus(req.user.id, req.body.status);
  res.json({ success: true });
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filename = req.file.filename;
    await updateProfileImage(req.user.id, filename);
    res.json({ success: true, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};
