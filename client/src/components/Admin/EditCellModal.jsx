import { useState } from 'react';

export default function EditCellModal({ cell, onClose, onSave }) {
  const [value, setValue] = useState(cell.value ?? '');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box admin-edit-modal" onClick={e => e.stopPropagation()}>
        <p className="admin-edit-title">עריכת: {cell.label}</p>
        {cell.options ? (
          <select value={value} onChange={e => setValue(e.target.value)} autoFocus className="admin-edit-input">
            {cell.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <textarea value={value} onChange={e => setValue(e.target.value)} rows={3} autoFocus className="admin-edit-textarea" />
        )}
        <div className="admin-edit-actions">
          <button onClick={() => onSave(value)}>שמור</button>
          <button onClick={onClose} className="btn-secondary">ביטול</button>
        </div>
      </div>
    </div>
  );
}
