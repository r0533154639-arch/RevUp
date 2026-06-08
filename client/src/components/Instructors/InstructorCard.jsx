import { useNavigate } from 'react-router-dom';

const SERVER = 'http://localhost:3000';

export default function InstructorCard({ instructor }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid #ddd', borderRadius: 8, alignItems: 'center' }}>
      <img
        src={instructor.profile_image ? `${SERVER}/uploads/${instructor.profile_image}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(instructor.name)}
        alt={instructor.name}
        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px' }}>{instructor.name}</h3>
        <p style={{ margin: '2px 0', color: '#555' }}>📍 {instructor.area}</p>
        <p style={{ margin: '2px 0', color: '#555' }}>📞 {instructor.phone}</p>
      </div>
      <button onClick={() => navigate(`/lessons/schedule?instructor=${instructor.id}`)}>קבע שיעור</button>
    </div>
  );
}
