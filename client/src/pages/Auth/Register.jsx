import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { VEHICLE_TYPES } from '../../constants/index.js';

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
  return errors;
};

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'student',
    date_of_birth: '', status: 'theory', vehicle_type_id: 1,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

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
    try {
      const res = await register(form);
      if (res?.token && photo) {
        const fd = new FormData();
        fd.append('photo', photo);
        const endpoint = form.role === 'instructor'
          ? 'http://localhost:3000/api/instructors/upload-photo'
          : 'http://localhost:3000/api/students/upload-photo';
        const uploadRes = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${res.token}` },
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.filename)
          updateUser({ ...res.user, profile_image: uploadData.filename });
      }
      if (res?.user) {
        if (res.user.role === 'instructor') {
          navigate(`/users/${res.user.id}/completeProfile`);
        } else {
          navigate(`/users/${res.user.id}/homePage`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const err = (field) => errors[field] && <span className="form-error">{errors[field]}</span>;

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
          <div>
            <label className="form-label">תמונת פרופיל (אופציונלי)</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="form-file" />
            {photoPreview && <img src={photoPreview} alt="preview" className="form-photo-preview" />}
          </div>
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
        <div className="form-section">
          <label className="form-label">תמונת פרופיל (אופציונלי)</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="form-file" />
          {photoPreview && <img src={photoPreview} alt="preview" className="form-photo-preview" />}
          <p className="form-hint">לאחר ההרשמה תועבר להשלמת פרטי הפרופיל שלך.</p>
        </div>
      )}

      <button type="submit">הרשמה</button>
    </form>
  );
}
