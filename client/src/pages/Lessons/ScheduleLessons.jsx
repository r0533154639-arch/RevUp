import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarView from '../../components/Lessons/CalendarView.jsx';
import FeedbackForm from '../../components/Lessons/FeedbackForm.jsx';
import { getLessons, scheduleLesson, submitFeedback } from '../../services/lessons.service.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function ScheduleLessons() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);

  const fetchLessons = () => getLessons().then(data => setLessons(Array.isArray(data) ? data : []));

  useEffect(() => { fetchLessons(); }, []);

  if (user?.role === 'student' && !user?.instructor_id) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <p style={{ fontSize: 18, marginBottom: 16 }}>עליך לבחור מורה לפני קביעת שיעורים</p>
        <button onClick={() => navigate(`/users/${user.id}/instructors`)}>חפש מורה</button>
      </div>
    );
  }

  const handleDate = async (date) => {
    await scheduleLesson({ instructorId: user.instructor_id, date, time: '10:00' });
    fetchLessons();
  };

  return (
    <div>
      <h2>קביעת שיעור</h2>
      <CalendarView lessons={lessons} onSelectDate={handleDate} />
      {lessons[0] && <FeedbackForm lessonId={lessons[0].id} onSubmit={submitFeedback} />}
    </div>
  );
}
