import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Select from 'react-select';
import WeeklyTemplateEditor from '../../components/Lessons/WeeklyTemplateEditor.jsx';
import { api } from '../../services/api.js';

const VEHICLE_TYPES = [
  { id: 1, name: 'רכב פרטי' },
  { id: 2, name: 'אופנוע' },
  { id: 3, name: 'משאית' },
  { id: 4, name: 'אוטובוס' },
];

export default function InstructorProfileCompletion() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ area: '', vehicle_types: [], years_experience: '' });
  const [cityOptions, setCityOptions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  useEffect(() => {
    fetch('https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=2000')
      .then(r => r.json())
      .then(data => {
        const opts = data.result.records
          .map(r => r['שם_ישוב']?.trim())
          .filter(Boolean)
          .sort()
          .map(name => ({ value: name, label: name }));
        setCityOptions(opts);
      });
  }, []);

  const toggleVehicleType = (id) => {
    setForm(f => ({
      ...f,
      vehicle_types: f.vehicle_types.includes(id)
        ? f.vehicle_types.filter(v => v !== id)
        : [...f.vehicle_types, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.area) { setError('יש לבחור עיר'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/instructors/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      // שמירת זמינות אם הוגדרה
      if (availabilitySlots.length > 0) {
        await api.put('/availability/template', { slots: availabilitySlots });
      }
      updateUser({ profile_status: data.profile_status });
      navigate(`/users/${user.id}/homePage`);
    } catch {
      setError('שגיאה בשמירת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => navigate(`/users/${user.id}/homePage`);

  return (
    <form onSubmit={handleSubmit}>
      <h2>השלמת פרופיל מורה</h2>
      <p style={{ color: '#555', marginBottom: 16 }}>
        מלא את הפרטים כדי שתלמידים יוכלו למצוא אותך. הפרופיל יישלח לאישור המנהל.
      </p>

      <div>
        <Select
          options={cityOptions}
          placeholder="בחר עיר לימוד"
          value={form.area ? { value: form.area, label: form.area } : null}
          onChange={(opt) => setForm(f => ({ ...f, area: opt?.value || '' }))}
          noOptionsMessage={() => 'לא נמצאו תוצאות'}
          classNamePrefix="city-select"
        />
      </div>

      <div style={{ margin: '12px 0' }}>
        <input
          type="number"
          placeholder="שנות ניסיון"
          min="0"
          value={form.years_experience}
          onChange={(e) => setForm(f => ({ ...f, years_experience: e.target.value }))}
        />
      </div>

      <fieldset className="vehicle-fieldset">
        <legend>סוגי רכב</legend>
        <div className="vehicle-grid">
          {VEHICLE_TYPES.map(v => (
            <label key={v.id} className="vehicle-label">
              <input
                type="checkbox"
                className="vehicle-checkbox"
                checked={form.vehicle_types.includes(v.id)}
                onChange={() => toggleVehicleType(v.id)}
              />
              {v.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>זמינות שבועית (אופציונלי)</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>בחר את השעות הקבועות בהן אתה זמין בכל שבוע. ניתן לשנות בכל עת.</p>
        <WeeklyTemplateEditor
          initialTemplate={{}}
          onSave={(slots) => setAvailabilitySlots(slots)}
          loading={false}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" disabled={loading}>{loading ? 'שומר...' : 'שמור ושלח לאישור'}</button>
        <button type="button" onClick={handleSkip} style={{ background: 'transparent', color: '#666', border: '1px solid #ccc' }}>
          דלג לעת עתה
        </button>
      </div>
    </form>
  );
}
