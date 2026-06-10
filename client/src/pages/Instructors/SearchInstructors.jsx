import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';
import { useAuth } from '../../hooks/useAuth.js';

const REGIONS = [
  { value: 'north',     label: 'צפון' },
  { value: 'center',    label: 'מרכז' },
  { value: 'jerusalem', label: 'ירושלים והסביבה' },
  { value: 'south',     label: 'דרום' },
  { value: 'sharon',    label: 'שרון' },
];

const VEHICLE_TYPES = ['רכב פרטי', 'אופנוע', 'משאית', 'אוטובוס'];

const REGION_CITIES = {
  north:     ['חיפה','נצרת','עכו','כרמיאל','טבריה','צפת','קריות','נהריה','יוקנעם','עפולה','בית שאן','מגדל העמק','שפרעם','אום אל פחם'],
  center:    ['תל אביב','רמת גן','פתח תקווה','ראשון לציון','חולון','בת ים','גבעתיים','בני ברק','הרצליה','רעננה','כפר סבא','רמת השרון','אור יהודה','לוד','רמלה','מודיעין','אזור','יהוד','קריית אונו','גבעת שמואל','ראש העין'],
  jerusalem: ['ירושלים','בית שמש','מעלה אדומים','מודיעין עילית','ביתר עילית','אבו גוש','קריית יערים'],
  south:     ['באר שבע','אשדוד','אשקלון','רהט','דימונה','קריית גת','נתיבות','שדרות','ערד','אילת','אופקים'],
  sharon:    ['נתניה','רעננה','כפר סבא','הוד השרון','רמת השרון','הרצליה','ראש העין','טייבה','קלנסווה'],
};

export default function SearchInstructors() {
  const { user } = useAuth();
  const [allInstructors, setAllInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [areas, setAreas] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    getInstructors()
      .then(data => setAllInstructors(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return allInstructors.filter(i => {
      // שם
      if (nameSearch && !i.name.includes(nameSearch)) return false;

      // אזור
      if (areas.length > 0) {
        const cities = areas.flatMap(a => REGION_CITIES[a] || []);
        if (!cities.some(c => i.area?.includes(c))) return false;
      }

      // סוג רישיון - פיצול המחרוזת למערך והשוואה מדויקת
      if (vehicleTypes.length > 0) {
        const instructorTypes = (i.vehicle_types || '').split(', ').map(s => s.trim());
        if (!vehicleTypes.some(vt => instructorTypes.includes(vt))) return false;
      }

      // דירוג
      if (minRating > 0 && (!i.avg_rating || i.avg_rating < minRating)) return false;

      return true;
    });
  }, [allInstructors, nameSearch, areas, vehicleTypes, minRating]);

  const toggleArea = (v) => setAreas(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
  const toggleVehicle = (v) => setVehicleTypes(t => t.includes(v) ? t.filter(x => x !== v) : [...t, v]);
  const hasFilters = areas.length > 0 || vehicleTypes.length > 0 || minRating > 0;

  if (user?.instructor_id) return <Navigate to={`/users/${user.id}/homePage`} />;

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <h2 style={{ marginBottom: 20 }}>חיפוש מורים</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', direction: 'rtl' }}>

        <div style={{ width: 190, flexShrink: 0, background: '#f9fafb', borderRadius: 12, padding: 16, border: '1px solid #e5e7eb' }}>
          <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>אזור</p>
          {REGIONS.map(r => (
            <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={areas.includes(r.value)} onChange={() => toggleArea(r.value)} style={{ width: 'auto', margin: 0, cursor: 'pointer' }} />
              {r.label}
            </label>
          ))}

          <hr style={{ margin: '14px 0', borderColor: '#e5e7eb' }} />

          <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>סוג רישיון</p>
          {VEHICLE_TYPES.map(v => (
            <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={vehicleTypes.includes(v)} onChange={() => toggleVehicle(v)} style={{ width: 'auto', margin: 0, cursor: 'pointer' }} />
              {v}
            </label>
          ))}

          <hr style={{ margin: '14px 0', borderColor: '#e5e7eb' }} />

          <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>דירוג מינימלי</p>
          <input
            type="range" min={0} max={5} step={0.5}
            value={minRating}
            onChange={e => setMinRating(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#2563eb' }}
          />
          <p style={{ fontSize: 13, color: '#374151', textAlign: 'center', marginTop: 4 }}>
            {minRating === 0 ? 'הכל' : `${'★'.repeat(Math.floor(minRating))}${minRating % 1 ? '½' : ''} (${minRating}+)`}
          </p>

          {hasFilters && (
            <button onClick={() => { setAreas([]); setVehicleTypes([]); setMinRating(0); }}
              style={{ marginTop: 14, width: '100%', background: '#f3f4f6', color: '#374151', fontSize: 13, padding: '6px 0', border: '1px solid #e5e7eb' }}>
              נקה סינון
            </button>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="חיפוש לפי שם מורה" value={nameSearch} onChange={e => setNameSearch(e.target.value)} style={{ marginBottom: 4 }} />
          {loading && <p>טוען...</p>}
          {error && <p style={{ color: 'red' }}>שגיאה: {error}</p>}
          {!loading && !error && filtered.length === 0 && <p style={{ color: '#888' }}>לא נמצאו מורים</p>}
          {filtered.map(i => <InstructorCard key={i.id} instructor={i} />)}
        </div>
      </div>
    </div>
  );
}
