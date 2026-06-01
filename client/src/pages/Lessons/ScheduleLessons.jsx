import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarView from '../../components/Lessons/CalendarView.jsx';
import FeedbackForm from '../../components/Lessons/FeedbackForm.jsx';
import { getLessons, scheduleLesson, submitFeedback } from '../../services/lessons.service.js';

export default function ScheduleLessons() {
  const [lessons, setLessons] = useState([]);
  const [searchParams] = useSearchParams();
  const instructorId = searchParams.get('instructor');

  const fetchLessons = () => getLessons().then(data => setLessons(Array.isArray(data) ? data : []));

  useEffect(() => { fetchLessons(); }, []);

  const handleDate = async (date) => {
    await scheduleLesson({ instructorId, date, time: '10:00' });
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
