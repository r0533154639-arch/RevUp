import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import HomePage from '../Home/HomePage.jsx';
import TheoryMaterials from '../../pages/Theory/TheoryMaterials.jsx';
import TheoryExam from '../../pages/Theory/TheoryExam.jsx';
import SearchInstructors from '../../pages/Instructors/SearchInstructors.jsx';
import Dashboard from '../../pages/Lessons/Dashboard.jsx';
import ScheduleLessons from '../../pages/Lessons/ScheduleLessons.jsx';
import DrivingTest from '../../pages/Tests/DrivingTest.jsx';
import LicenseReady from '../../pages/Graduation/LicenseReady.jsx';
import StudentsList from '../../pages/Instructor/StudentsList.jsx';
import Achievements from '../../pages/Instructor/Achievements.jsx';
import Posts from '../../pages/Instructor/Posts.jsx';
import AdminDashboard from '../../pages/Admin/AdminDashboard.jsx';

const PAGE_MAP = {
  homePage:     { component: HomePage },
  theory:       { component: TheoryMaterials,  allowedRoles: ['student'] },
  theoryExam:   { component: TheoryExam,       allowedRoles: ['student'] },
  instructors:  { component: SearchInstructors },
  lessons:      { component: Dashboard,        allowedRoles: ['student', 'instructor'] },
  schedule:     { component: ScheduleLessons,  allowedRoles: ['student', 'instructor'] },
  test:         { component: DrivingTest,      allowedRoles: ['student'] },
  license:      { component: LicenseReady,     allowedRoles: ['student'] },
  students:     { component: StudentsList,     allowedRoles: ['instructor'] },
  achievements: { component: Achievements,     allowedRoles: ['instructor'] },
  posts:        { component: Posts },
  admin:        { component: AdminDashboard, allowedRoles: ['admin'] },
};

export default function DynamicPage() {
  const { page } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const entry = PAGE_MAP[page];

  if (!entry) return <Navigate to="/" />;
  if (entry.allowedRoles && !entry.allowedRoles.includes(user.role) && user.role !== 'admin') return <Navigate to="/" />;

  const needsInstructor = (page === 'lessons' || page === 'schedule') && user.role === 'student' && !user.instructor_id;
  if (needsInstructor) {
    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <p className="modal-title">⚠️ לא נבחר מורה</p>
          <p className="modal-text">לא ניתן לקבוע שיעורים לפני שבוחרים מורה נהיגה.</p>
          <div className="modal-actions">
            <button onClick={() => navigate(`/users/${user.id}/instructors`)}>לבחירת מורה לחץ כאן</button>
            <button className="btn-secondary" onClick={() => navigate(`/users/${user.id}/homePage`)}>חזרה לדף הבית</button>
          </div>
        </div>
      </div>
    );
  }

  const Component = entry.component;
  return <Component user={user} />;
}
