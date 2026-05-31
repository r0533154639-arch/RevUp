import { useNavigate } from 'react-router-dom';

export default function InstructorCard({ instructor }) {
  const navigate = useNavigate();
  return (
    <div>
      <h3>{instructor.name}</h3>
      <p>אזור: {instructor.area}</p>
      <p>דירוג: {instructor.rating} ⭐</p>
      <button onClick={() => navigate(`/lessons/schedule?instructor=${instructor.id}`)}>קבע שיעור</button>
    </div>
  );
}
