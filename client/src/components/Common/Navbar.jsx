import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getMyInstructor } from '../../services/stats.service.js';

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
];

function ProfileDropdown({ user, onLogout, onClose }) {
  const [mode, setMode] = useState('info'); // 'info' | 'edit'
  const [form, setForm] = useState({ phone: '', date_of_birth: '', area: '', vehicle_types: [] });
  const [fullUser, setFullUser] = useState(null);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
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
    <div ref={ref} style={{
      position: 'absolute', left: 0, top: 'calc(100% + 10px)',
      background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb', minWidth: 260, zIndex: 100, padding: 20,
      direction: 'rtl', textAlign: 'right',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {avatar
          ? <img src={avatar} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
          : <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>{displayUser.name?.[0]}</div>
        }
        <span style={{ fontWeight: 700, fontSize: 15 }}>{displayUser.name}</span>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{displayUser.email}</span>
      </div>

      {mode === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#374151' }}>
          {displayUser.phone && <span>📞 {displayUser.phone}</span>}
          {displayUser.date_of_birth && <span>🎂 {new Date(displayUser.date_of_birth).toLocaleDateString('he-IL')}</span>}
          {displayUser.area && <span>📍 {displayUser.area}</span>}
          {user.role === 'instructor' && fullUser?.vehicle_types?.length > 0 && (
            <span>🚗 {vehicleTypeOptions.filter(v => fullUser.vehicle_types.includes(v.id)).map(v => v.name).join(', ')}</span>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => setMode('edit')} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13, cursor: 'pointer' }}>עריכה</button>
            <button onClick={onLogout} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>התנתקות</button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, color: '#6b7280' }}>תמונה</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {avatar && <img src={avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 12, margin: 0, padding: '3px 0' }} />
          </div>
          <input placeholder="טלפון" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ fontSize: 13, padding: '6px 10px', margin: 0 }} />
          <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} style={{ fontSize: 13, padding: '6px 10px', margin: 0 }} />
          {user.role === 'instructor' && (
            <>
              <input placeholder="אזור" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} style={{ fontSize: 13, padding: '6px 10px', margin: 0 }} />
              <label style={{ fontSize: 12, color: '#6b7280' }}>סוגי רכב</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {vehicleTypeOptions.map(vt => (
                  <label key={vt.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.vehicle_types.includes(vt.id)} onChange={() => toggleVehicleType(vt.id)} />
                    {vt.name}
                  </label>
                ))}
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13, cursor: 'pointer' }}>{saving ? 'שומר...' : 'שמור'}</button>
            <button onClick={() => setMode('info')} style={{ flex: 1, background: '#f3f4f6', color: '#333', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13, cursor: 'pointer' }}>ביטול</button>
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
    </nav>
  );
}
