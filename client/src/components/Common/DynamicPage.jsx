import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import HomePage from '../Home/HomePage.jsx';
import TheoryMaterials from '../../pages/Theory/TheoryMaterials.jsx';
import TheoryExam from '../../pages/Theory/TheoryExam.jsx';
import SearchInstructors from '../../pages/Instructors/SearchInstructors.jsx';
import Dashboard from '../../pages/Lessons/Dashboard.jsx';
import ScheduleLessons from '../../pages/Lessons/ScheduleLessons.jsx';
import DrivingTest from '../../pages/Tests/DrivingTest.jsx';
import LicenseReady from '../../pages/Graduation/LicenseReady.jsx';

const PAGE_MAP = {
  homePage: HomePage,
  theory: TheoryMaterials,
  theoryExam: TheoryExam,
  instructors: SearchInstructors,
  lessons: HomePage,
  schedule: ScheduleLessons,
  test: DrivingTest,
  license: LicenseReady,
};

export default function DynamicPage() {
  const { page } = useParams();
  const { user } = useAuth();
  const Component = PAGE_MAP[page];
  if (!Component) return <Navigate to="/login" />;
  return <Component user={user} />;
}
