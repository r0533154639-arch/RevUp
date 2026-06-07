import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchPosts = () => api.get('/posts').then(setPosts);

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/posts/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post('/posts', form);
    }
    setForm({ title: '', content: '' });
    fetchPosts();
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
  };

  const formatDate = (dt) => {
    const d = new Date(dt);
    return `${d.toLocaleDateString('he-IL')} ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="page-container">
      <h2>{editingId ? 'עריכת פוסט' : 'פוסטים'}</h2>

      {user?.role === 'instructor' && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <input
            placeholder="כותרת"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            placeholder="תוכן הפוסט..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={4}
            required
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{editingId ? 'שמור' : 'פרסם'}</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', content: '' }); }}
                style={{ background: '#999' }}>
                ביטול
              </button>
            )}
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0 }}>{post.title}</h3>
              <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', marginRight: 12 }}>
                {formatDate(post.created_at)}
              </span>
            </div>
            <p style={{ margin: '8px 0', color: '#555' }}>{post.content}</p>
            <small style={{ color: '#999' }}>✍️ {post.instructor_name}</small>
            {user?.id === post.instructor_id && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => startEdit(post)} style={{ background: '#f0a500' }}>ערוך</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
