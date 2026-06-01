import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import Select from 'react-select';

const VEHICLE_TYPES = [
  { id: 1, name: 'רכב פרטי' },
  { id: 2, name: 'אופנוע' },
  { id: 3, name: 'משאית' },
  { id: 4, name: 'אוטובוס' },
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'student', date_of_birth: '',
    status: 'theory', area: '', vehicle_types: [],
  });
  const [cityOptions, setCityOptions] = useState([]);
  const { register } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
  };

  const toggleVehicleType = (id) => {
    setForm(f => ({
      ...f,
      vehicle_types: f.vehicle_types.includes(id)
        ? f.vehicle_types.filter(v => v !== id)
        : [...f.vehicle_types, id],
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>הרשמה</h2>
      <input placeholder="שם מלא" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input type="email" placeholder="אימייל" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="tel" placeholder="טלפון" dir="rtl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} required />
      <input type="password" placeholder="סיסמה" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <Select
        options={[{ value: 'student', label: 'תלמיד' }, { value: 'instructor', label: 'מורה' }]}
        value={{ value: form.role, label: form.role === 'student' ? 'תלמיד' : 'מורה' }}
        onChange={(opt) => setForm({ ...form, role: opt.value })}
        isSearchable={false}
        classNamePrefix="city-select"
      />

      {form.role === 'student' && (
        <Select
          options={[
            { value: 'theory', label: 'תאוריה' },
            { value: 'lessons', label: 'שיעורים' },
            { value: 'test', label: 'טסט' },
            { value: 'licensed', label: 'מורשה' },
          ]}
          value={{ value: form.status, label: { theory: 'תאוריה', lessons: 'שיעורים', test: 'טסט', licensed: 'מורשה' }[form.status] }}
          onChange={(opt) => setForm({ ...form, status: opt.value })}
          isSearchable={false}
          classNamePrefix="city-select"
        />
      )}

      {form.role === 'instructor' && (
        <>
          <Select
            options={cityOptions}
            placeholder="בחר עיר"
            value={form.area ? { value: form.area, label: form.area } : null}
            onChange={(opt) => setForm({ ...form, area: opt?.value || '' })}
            noOptionsMessage={() => 'לא נמצאו תוצאות'}
            classNamePrefix="city-select"
          />
          <fieldset className="vehicle-fieldset">
            <legend>סוגי רכב</legend>
            <div className="vehicle-grid">
              {VEHICLE_TYPES.map(v => (
                <label key={v.id} className="vehicle-label">
                  <input type="checkbox" className="vehicle-checkbox" checked={form.vehicle_types.includes(v.id)} onChange={() => toggleVehicleType(v.id)} />
                  {v.name}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <button type="submit">הרשמה</button>
    </form>
  );
}
