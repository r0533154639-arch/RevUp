import { getAllStudents, updateStudentStatus, getAllInstructors, getInstructorAchievements, getAllPosts, getAllComments, toggleUserBlock, getAllUsers } from '../dal/admin.dal.js';

export const getStudents = async (req, res) => {
  try {
    console.log('Getting all students...');
    const students = await getAllStudents();
    console.log('Students found:', students.length);
    res.json(students);
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    console.log('Updating student status:', req.params.studentId, req.body.status);
    const { studentId } = req.params;
    const { status } = req.body;
    await updateStudentStatus(studentId, status);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in updateStatus:', err);
    res.status(500).json({ message: err.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;
    console.log('Toggling user block:', userId, 'blocked:', isBlocked);
    await toggleUserBlock(userId, isBlocked);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in blockUser:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    console.log('Getting all users...');
    const users = await getAllUsers();
    console.log('Users found:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getInstructors = async (req, res) => {
  try {
    console.log('Getting all instructors...');
    const instructors = await getAllInstructors();
    console.log('Instructors found:', instructors.length);
    res.json(instructors);
  } catch (err) {
    console.error('Error in getInstructors:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getAchievements = async (req, res) => {
  try {
    const { instructorId } = req.params;
    console.log('Getting achievements for instructor:', instructorId);
    const achievements = await getInstructorAchievements(instructorId);
    res.json(achievements);
  } catch (err) {
    console.error('Error in getAchievements:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    console.log('Getting all posts...');
    const posts = await getAllPosts();
    console.log('Posts found:', posts.length);
    res.json(posts);
  } catch (err) {
    console.error('Error in getPosts:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    console.log('Getting all comments...');
    const comments = await getAllComments();
    console.log('Comments found:', comments.length);
    res.json(comments);
  } catch (err) {
    console.error('Error in getComments:', err);
    res.status(500).json({ message: err.message });
  }
};