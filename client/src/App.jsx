import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import TheoryMaterials from './pages/Theory/TheoryMaterials.jsx';
import TheoryExam from './pages/Theory/TheoryExam.jsx';
import SearchInstructors from './pages/Instructors/SearchInstructors.jsx';
import Dashboard from './pages/Lessons/Dashboard.jsx';
import ScheduleLessons from './pages/Lessons/ScheduleLessons.jsx';
import DrivingTest from './pages/Tests/DrivingTest.jsx';
import LicenseReady from './pages/Graduation/LicenseReady.jsx';
import Navbar from './components/Common/Navbar.jsx';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/theory" element={<TheoryMaterials />} />
        <Route path="/theory/exam" element={<TheoryExam />} />
        <Route path="/instructors" element={<SearchInstructors />} />
        <Route path="/lessons" element={<Dashboard />} />
        <Route path="/lessons/schedule" element={<ScheduleLessons />} />
        <Route path="/test" element={<DrivingTest />} />
        <Route path="/license" element={<LicenseReady />} />
      </Routes>
    </>
  );
}

export default App;
