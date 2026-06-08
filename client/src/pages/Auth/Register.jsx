import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import Select from 'react-select';

const VEHICLE_TYPES = [
  { id: 1, name: 'רכב פרטי' },
  { id: 2, name: 'אופנוע' },
  { id: 3, name: 'משאית' },
  { id: 4, name: 'אוטובוס' },
];

const validate = (form) => {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = 'שם חייב להכיל לפחות 2 תווים';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'כתובת אימייל לא תקינה';
  if (!/^05\d{8}$/.test(form.phone))
    errors.phone = 'מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות';
  if (!form.date_of_birth)
    errors.date_of_birth = 'תאריך לידה הוא שדה חובה';
  else {
    const age = (new Date() - new Date(form.date_of_birth)) / (1000 * 60 * 60 * 24 * 365);
    if (age < 16) errors.date_of_birth = 'גיל מינימלי הוא 16';
  }
  if (form.password.length < 8)
    errors.password = 'סיסמה חייבת להכיל לפחות 8 תווים';
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'סיסמה חייבת להכיל לפחות אות גדולה אחת';
  else if (!/[0-9]/.test(form.password))
    errors.password = 'סיסמה חייבת להכיל לפחות ספרה אחת';
  if (form.role === 'instructor' && !form.area)
    errors.area = 'יש לבחור עיר';
  return errors;
};

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'student', date_of_birth: '',
    status: 'theory', area: '', vehicle_types: [], vehicle_type_id: 1, test_center: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const res = await register(form);
    if (res?.token && photo && form.role === 'instructor') {
      const fd = new FormData();
      fd.append('photo', photo);
      await fetch('http://localhost:3000/api/instructors/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${res.token}` },
        body: fd,
      });
    }
  };

  const toggleVehicleType = (id) => {
    handleChange('vehicle_types', form.vehicle_types.includes(id)
      ? form.vehicle_types.filter(v => v !== id)
      : [...form.vehicle_types, id]);
  };

  const err = (field) => errors[field] && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors[field]}</span>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>הרשמה</h2>

      <div>
        <input placeholder="שם מלא" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        {err('name')}
      </div>
      <div>
        <input type="email" placeholder="אימייל" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        {err('email')}
      </div>
      <div>
        <input type="tel" placeholder="טלפון" dir="rtl" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        {err('phone')}
      </div>
      <div>
        <input type="date" value={form.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
        {err('date_of_birth')}
      </div>
      <div>
        <input type="password" placeholder="סיסמה" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
        {err('password')}
      </div>

      <Select
        options={[{ value: 'student', label: 'תלמיד' }, { value: 'instructor', label: 'מורה' }]}
        value={{ value: form.role, label: form.role === 'student' ? 'תלמיד' : 'מורה' }}
        onChange={(opt) => handleChange('role', opt.value)}
        isSearchable={false}
        classNamePrefix="city-select"
      />

      {form.role === 'student' && (
        <>
          <Select
            options={[
              { value: 'theory', label: 'תאוריה' },
              { value: 'lessons', label: 'שיעורים' },
              { value: 'test', label: 'טסט' },
              { value: 'licensed', label: 'מורשה' },
            ]}
            value={{ value: form.status, label: { theory: 'תאוריה', lessons: 'שיעורים', test: 'טסט', licensed: 'מורשה' }[form.status] }}
            onChange={(opt) => handleChange('status', opt.value)}
            isSearchable={false}
            classNamePrefix="city-select"
          />
          <Select
            options={VEHICLE_TYPES.map(v => ({ value: v.id, label: v.name }))}
            placeholder="בחר סוג רכב"
            value={form.vehicle_type_id ? { value: form.vehicle_type_id, label: VEHICLE_TYPES.find(v => v.id === form.vehicle_type_id)?.name } : null}
            onChange={(opt) => handleChange('vehicle_type_id', opt.value)}
            isSearchable={false}
            classNamePrefix="city-select"
          />
        </>
      )}

      {form.role === 'instructor' && (
        <>
          <div>
            <Select
              options={cityOptions}
              placeholder="בחר עיר"
              value={form.area ? { value: form.area, label: form.area } : null}
              onChange={(opt) => handleChange('area', opt?.value || '')}
              noOptionsMessage={() => 'לא נמצאו תוצאות'}
              classNamePrefix="city-select"
            />
            {err('area')}
          </div>
          <input
            placeholder="מכון בחינה"
            value={form.test_center}
            onChange={(e) => handleChange('test_center', e.target.value)}
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
          <div style={{ margin: '8px 0' }}>
            <label style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>תמונת פרופיל (אופציונלי)</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ padding: 0 }} />
            {photoPreview && (
              <img src={photoPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />
            )}
          </div>
        </>
      )}

      <button type="submit">הרשמה</button>
    </form>
  );
}
