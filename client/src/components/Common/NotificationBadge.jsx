import { useState } from 'react';

export default function NotificationBadge({ count, tooltips = [] }) {
  const [show, setShow] = useState(false);

  if (!count || count <= 0) return null;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        background: '#ef4444', color: '#fff',
        borderRadius: '50%', width: 22, height: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, cursor: 'default',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        {count > 9 ? '9+' : count}
      </span>

      {show && tooltips.length > 0 && (
        <div style={{
          position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)',
          background: '#1f2937', color: '#fff',
          borderRadius: 6, padding: '6px 10px',
          fontSize: 12, whiteSpace: 'nowrap',
          zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          minWidth: 160, textAlign: 'right',
          lineHeight: 1.6,
        }}>
          {tooltips.map((t, i) => <div key={i}>{t}</div>)}
          <div style={{
            position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderBottom: '5px solid #1f2937',
          }} />
        </div>
      )}
    </div>
  );
}
