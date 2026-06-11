import { useState, useEffect, useMemo } from 'react';
import InstructorCard from '../../components/Instructors/InstructorCard.jsx';
import { getInstructors } from '../../services/stats.service.js';
import { api } from '../../services/api.js';
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
  const [myRequest, setMyRequest] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [areas, setAreas] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    api.get('/student-requests/my-status').then(setMyRequest).catch(() => {});
    getInstructors()
      .then(data => setAllInstructors(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return allInstructors.filter(i => {
      if (nameSearch && !i.name.includes(nameSearch)) return false;
      if (areas.length > 0) {
        const cities = areas.flatMap(a => REGION_CITIES[a] || []);
        if (!cities.some(c => i.area?.includes(c))) return false;
      }
      if (vehicleTypes.length > 0) {
        const instructorTypes = (i.vehicle_types || '').split(', ').map(s => s.trim());
        if (!vehicleTypes.some(vt => instructorTypes.includes(vt))) return false;
      }
      if (minRating > 0 && (!i.avg_rating || i.avg_rating < minRating)) return false;
      return true;
    });
  }, [allInstructors, nameSearch, areas, vehicleTypes, minRating]);

  const toggleArea = (v) => setAreas(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
  const toggleVehicle = (v) => setVehicleTypes(t => t.includes(v) ? t.filter(x => x !== v) : [...t, v]);
  const hasFilters = areas.length > 0 || vehicleTypes.length > 0 || minRating > 0;

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <h2>חיפוש מורים</h2>

      {myRequest?.status === 'pending' && (
        <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#92400e', fontWeight: 500 }}>
          ⏳ בקשתך ל-<strong>{myRequest.instructor_name}</strong> ממתינה לאישור המורה.
        </div>
      )}
      {myRequest?.status === 'rejected' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#991b1b', fontWeight: 500 }}>
          ❌ המורה <strong>{myRequest.instructor_name}</strong> דחה את בקשתך. תוכל לבחור מורה אחר.
        </div>
      )}
      {myRequest?.status === 'approved' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#166534', fontWeight: 500 }}>
          ✅ <strong>{myRequest.instructor_name}</strong> אישר אותך כתלמיד שלו!
        </div>
      )}

      <div className="search-instructors-layout">
        <div className="search-filters">
          <p className="filter-title">אזור</p>
          {REGIONS.map(r => (
            <label key={r.value} className="filter-label">
              <input type="checkbox" checked={areas.includes(r.value)} onChange={() => toggleArea(r.value)} />
              {r.label}
            </label>
          ))}

          <hr className="filter-divider" />

          <p className="filter-title">סוג רישיון</p>
          {VEHICLE_TYPES.map(v => (
            <label key={v} className="filter-label">
              <input type="checkbox" checked={vehicleTypes.includes(v)} onChange={() => toggleVehicle(v)} />
              {v}
            </label>
          ))}

          <hr className="filter-divider" />

          <p className="filter-title">דירוג מינימלי</p>
          <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} />
          <p className="filter-rating-value">
            {minRating === 0 ? 'הכל' : `${'★'.repeat(Math.floor(minRating))}${minRating % 1 ? '½' : ''} (${minRating}+)`}
          </p>

          {hasFilters && (
            <button
              onClick={() => { setAreas([]); setVehicleTypes([]); setMinRating(0); }}
              className="btn-secondary"
              style={{ marginTop: 14, width: '100%', fontSize: 13, padding: '6px 0' }}
            >
              נקה סינון
            </button>
          )}
        </div>

        <div className="search-results">
          <input placeholder="חיפוש לפי שם מורה" value={nameSearch} onChange={e => setNameSearch(e.target.value)} />
          {loading && <p className="text-muted">טוען...</p>}
          {error && <p className="error-msg">שגיאה: {error}</p>}
          {!loading && !error && filtered.length === 0 && <p className="text-muted">לא נמצאו מורים</p>}
          {filtered.map(i => (
            <InstructorCard
              key={i.id}
              instructor={i}
              requestStatus={myRequest?.instructor_user_id === i.user_id ? myRequest?.status : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
