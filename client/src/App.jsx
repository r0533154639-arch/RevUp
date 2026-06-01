import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Navbar from './components/Common/Navbar.jsx';
import DynamicPage from './components/Common/DynamicPage.jsx';

function App() {
  const { user } = useAuth();
  const username = user?.id;

  return (
    <>
      <Navbar username={username} />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/users/${username}/homePage`} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={`/users/${username}/homePage`} />} />
        <Route path="/users/:username/:page" element={user ? <DynamicPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? `/users/${username}/homePage` : '/login'} />} />
      </Routes>
    </>
  );
}

export default App;