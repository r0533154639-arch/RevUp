import { useState } from 'react';

export default function NotificationBadge({ count, tooltips = [] }) {
  const [show, setShow] = useState(false);

  if (!count || count <= 0) return null;

  return (
    <div
      className="notification-badge-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="notification-badge">
        {count > 9 ? '9+' : count}
      </span>

      {show && tooltips.length > 0 && (
        <div className="notification-tooltip">
          {tooltips.map((t, i) => <div key={i}>{t}</div>)}
          <div className="notification-tooltip-arrow" />
        </div>
      )}
    </div>
  );
}
