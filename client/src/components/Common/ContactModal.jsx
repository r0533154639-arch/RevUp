import { useState } from 'react';
import { api } from '../../services/api.js';

export default function ContactModal({ onClose }) {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/communication/contact', form);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={e => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose}>✕</button>

        {status === 'sent' ? (
          <div className="contact-success">
            <span className="contact-success-icon">✅</span>
            <h3>הפנייה נשלחה בהצלחה</h3>
            <p>נחזור אליך בהקדם האפשרי.</p>
            <button onClick={onClose}>סגור</button>
          </div>
        ) : (
          <>
            <h3 className="contact-modal-title">יצירת קשר</h3>
            <p className="contact-modal-sub">נשמח לעזור — מלא את הפרטים ונחזור אליך</p>
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                placeholder="נושא"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                required
              />
              <textarea
                placeholder="תוכן ההודעה..."
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
              />
              {status === 'error' && <span className="error-msg">שגיאה בשליחה, נסה שנית</span>}
              <button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'שולח...' : 'שלח פנייה'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
