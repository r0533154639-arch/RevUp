import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getMyInstructor } from '../../services/stats.service.js';
import ContactModal from './ContactModal.jsx';
import Select from 'react-select';

const SERVER = 'http://localhost:3000';

const INSTRUCTOR_LINKS = [
  { label: 'לוח זמנים', page: 'schedule' },
  { label: 'התלמידים שלי', page: 'students' },
  { label: 'הישגים', page: 'achievements' },
  { label: 'פוסטים', page: 'posts' },
];

const ADMIN_TABS = [
  { label: 'תלמידים', page: 'adminStudents' },
  { label: 'מורים', page: 'adminInstructors' },
  { label: 'פוסטים', page: 'adminPosts' },
  { label: 'תגובות', page: 'adminComments' },
  { label: 'שיעורים', page: 'adminLessons' },
  { label: 'פניות', page: 'adminContacts' },
];

function ProfileDropdown({ user, onLogout, onClose }) {
  const [mode, setMode] = useState('info');
  const [form, setForm] = useState({ phone: '', date_of_birth: '', area: '', vehicle_types: [] });
  const [fullUser, setFullUser] = useState(null);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const { updateUser } = useAuth();
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(data => {
        setFullUser(data);
        setForm({
          phone: data.phone || '',
          date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : '',
          area: data.area || '',
          vehicle_types: data.vehicle_types || [],
        });
      })
      .catch(() => {});

    if (user.role === 'instructor') {
      fetch('/api/auth/vehicle-types')
        .then(r => r.json())
        .then(setVehicleTypeOptions)
        .catch(() => {});

      fetch('https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=2000')
        .then(r => r.json())
        .then(data => {
          const opts = data.result.records
            .map(r => r['שם_ישוב']?.trim())
            .filter(Boolean)
            .sort()
            .map(name => ({ value: name, label: name }));
          setCityOptions(opts);
        })
        .catch(() => {});
    }
  }, [user.id]);

  const toggleVehicleType = (id) => {
    setForm(f => ({
      ...f,
      vehicle_types: f.vehicle_types.includes(id)
        ? f.vehicle_types.filter(v => v !== id)
        : [...f.vehicle_types, id],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('phone', form.phone);
      formData.append('date_of_birth', form.date_of_birth);
      if (user.role === 'instructor') {
        formData.append('area', form.area);
        formData.append('vehicle_types', JSON.stringify(form.vehicle_types));
      }
      if (imageFile) formData.append('profile_image', imageFile);

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      updateUser(data);
      setFullUser(data);
      setMode('info');
      setImageFile(null);
      setImagePreview(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const displayUser = fullUser || user;
  const avatar = imagePreview || (displayUser.profile_image ? `${SERVER}/uploads/${displayUser.profile_image}` : null);

  return (
    <div ref={ref} className="profile-dropdown">
      <div className="profile-dropdown-header">
        {avatar
          ? <img src={avatar} alt="" className="profile-dropdown-avatar-img" />
          : <div className="profile-dropdown-avatar">{displayUser.name?.[0]}</div>
        }
        <span className="profile-dropdown-name">{displayUser.name}</span>
        <span className="profile-dropdown-email">{displayUser.email}</span>
      </div>

      {mode === 'info' && (
        <div className="profile-dropdown-info">
          {displayUser.phone && <span>📞 {displayUser.phone}</span>}
          {displayUser.date_of_birth && <span>🎂 {new Date(displayUser.date_of_birth).toLocaleDateString('he-IL')}</span>}
          {displayUser.area && <span>📍 {displayUser.area}</span>}
          {user.role === 'instructor' && fullUser?.vehicle_types?.length > 0 && (
            <span>🚗 {vehicleTypeOptions.filter(v => fullUser.vehicle_types.includes(v.id)).map(v => v.name).join(', ')}</span>
          )}
          <div className="profile-dropdown-actions">
            <button className="btn-edit" onClick={() => setMode('edit')}>עריכה</button>
            <button className="btn-logout" onClick={onLogout}>התנתקות</button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="profile-dropdown-edit">
          <label>תמונה</label>
          <div className="profile-preview-row">
            {avatar && <img src={avatar} alt="" className="profile-preview-thumb" />}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 12, margin: 0, padding: '3px 0' }} />
          </div>
          <input placeholder="טלפון" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
          {user.role === 'instructor' && (
            <>
              <label>עיר</label>
              <Select
                options={cityOptions}
                placeholder="חפש עיר..."
                value={form.area ? { value: form.area, label: form.area } : null}
                onChange={opt => setForm(f => ({ ...f, area: opt?.value || '' }))}
                noOptionsMessage={() => 'לא נמצאו תוצאות'}
                loadingMessage={() => 'טוען...'}
                isLoading={cityOptions.length === 0}
                classNamePrefix="city-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
              <label>סוגי רכב</label>
              <div className="vehicle-chips">
                {vehicleTypeOptions.map(vt => (
                  <label key={vt.id}>
                    <input type="checkbox" checked={form.vehicle_types.includes(vt.id)} onChange={() => toggleVehicleType(vt.id)} />
                    {vt.name}
                  </label>
                ))}
              </div>
            </>
          )}
          <div className="profile-dropdown-actions">
            <button onClick={handleSave} disabled={saving}>{saving ? 'שומר...' : 'שמור'}</button>
            <button className="btn-secondary" onClick={() => setMode('info')}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && user.instructor_id === undefined) {
      getMyInstructor()
        .then(({ instructor_id }) => updateUser({ instructor_id }))
        .catch(() => {});
    }
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const studentLinks = [
    { label: 'תאוריה', page: 'theory' },
    { label: 'שיעורים', page: 'lessons' },
    { label: 'טסט', page: 'test' },
    { label: 'פוסטים', page: 'posts' },
    ...(!user?.instructor_id ? [{ label: 'חפש מורה', page: 'instructors' }] : []),
  ];

  const links = user?.role === 'instructor' ? INSTRUCTOR_LINKS : studentLinks;

  return (
    <nav>
      <Link to={user ? `/users/${user.id}/homePage` : '/'}>RevUp</Link>

      <div className="nav-links">
        {user && (user.role === 'admin'
          ? ADMIN_TABS.map(({ label, page }) => (
              <Link key={page} to={`/users/${user.id}/${page}`}>{label}</Link>
            ))
          : links.map(({ label, page }) => (
              <Link key={page} to={`/users/${user.id}/${page}`}>{label}</Link>
            ))
        )}
        {user && user.role !== 'admin' && <button className="nav-contact-btn" onClick={() => setContactOpen(true)}>צור קשר</button>}
      </div>

      {user ? (
        <div className="nav-profile">
          <div className="nav-profile-trigger" onClick={() => setMenuOpen(o => !o)}>
            {user.profile_image
              ? <img src={`${SERVER}/uploads/${user.profile_image}`} alt="פרופיל" className="nav-avatar" />
              : <div className="nav-avatar-placeholder">{user.name?.[0]}</div>
            }
            <span className="nav-username">{user.name}</span>
          </div>
          {menuOpen && (
            <ProfileDropdown
              user={user}
              onLogout={handleLogout}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      ) : (
        <div className="nav-auth-links">
          <Link to="/login">כניסה</Link>
          <Link to="/register">הרשמה</Link>
        </div>
      )}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </nav>
  );
}
