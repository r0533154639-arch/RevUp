import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/communication/contact')
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p className="text-muted">טוען...</p></div>;

  return (
    <div className="page-container">
      <h2>פניות יצירת קשר</h2>
      <p className="contact-admin-count">{contacts.length} פניות בסך הכל</p>

      {contacts.length === 0 ? (
        <p className="text-muted" style={{ marginTop: 24 }}>אין פניות עדיין</p>
      ) : (
        <div className="contact-list">
          {contacts.map(c => (
            <div key={c.id} className="contact-card">
              <div className="contact-card-header">
                <div className="contact-card-user">
                  <span className="contact-card-name">{c.user_name}</span>
                  <span className="contact-card-email">{c.user_email}</span>
                </div>
                <span className="contact-card-date">
                  {new Date(c.created_at).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="contact-card-subject">{c.subject}</p>
              <p className="contact-card-message">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
