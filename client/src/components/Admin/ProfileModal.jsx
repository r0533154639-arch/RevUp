import { SERVER } from '../../constants/index.js';

export default function ProfileModal({ user: u, onClose, onBlock }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box admin-profile-modal" onClick={e => e.stopPropagation()}>
        {u.profile_image && <img src={`${SERVER}/uploads/${u.profile_image}`} alt="" className="admin-profile-image" />}
        <p><strong>שם:</strong> {u.name}</p>
        {u.email && <p><strong>אימייל:</strong> {u.email}</p>}
        {u.phone && <p><strong>טלפון:</strong> {u.phone}</p>}
        {u.date_of_birth && <p><strong>ת. לידה:</strong> {new Date(u.date_of_birth).toLocaleDateString('he-IL')}</p>}
        {u.area && <p><strong>אזור:</strong> {u.area}</p>}
        {u.vehicle_type && <p><strong>סוג רכב:</strong> {u.vehicle_type}</p>}
        {u.instructor_name && <p><strong>מורה:</strong> {u.instructor_name}</p>}
        {u.student_count !== undefined && <p><strong>תלמידים:</strong> {u.student_count}</p>}
        {'is_blocked' in u && <p><strong>סטטוס:</strong> {u.is_blocked ? '🚫 חסום' : '✅ פעיל'}</p>}
        {'is_blocked' in u && (
          <div className="admin-profile-actions">
            <button className={`admin-block-btn ${u.is_blocked ? 'unblock' : 'block'}`} onClick={() => onBlock(u)}>
              {u.is_blocked ? 'בטל חסימה' : 'חסום משתמש'}
            </button>
            <button onClick={onClose} className="btn-secondary">סגור</button>
          </div>
        )}
        {'is_blocked' in u === false && (
          <div className="admin-profile-actions">
            <button onClick={onClose} className="btn-secondary">סגור</button>
          </div>
        )}
      </div>
    </div>
  );
}
