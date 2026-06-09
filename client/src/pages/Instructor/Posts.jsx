import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const SERVER = 'http://localhost:3000';

function Avatar({ image, name, size = 40 }) {
  return image
    ? <img src={`${SERVER}/uploads/${image}`} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>{name?.[0]}</div>;
}

function CommentItem({ c, postId, user, onReload }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const remove = async () => {
    await api.delete(`/posts/${postId}/comments/${c.id}`);
    onReload();
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await api.post(`/posts/${postId}/comments`, { content: replyText, parent_comment_id: c.id });
    setReplyText('');
    setReplyOpen(false);
    onReload();
  };

  const canDelete = user?.id === c.user_id || user?.role === 'admin';

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#f8f9fa', borderRadius: 8, padding: '8px 10px' }}>
        <Avatar image={c.author_image} name={c.author_name} size={30} />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{c.author_name}</span>
          <p style={{ margin: '2px 0', fontSize: 14, color: '#333' }}>{c.content}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(c.created_at).toLocaleString('he-IL')}</span>
            {user && <button onClick={() => setReplyOpen(o => !o)} style={{ background: 'none', color: '#1a73e8', padding: '0 4px', fontSize: 12 }}>↩ הגב</button>}
            {canDelete && <button onClick={remove} style={{ background: 'none', color: '#e53935', padding: '0 4px', fontSize: 12 }}>מחק</button>}
          </div>
          {replyOpen && (
            <form onSubmit={submitReply} style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`השב ל${c.author_name}...`} style={{ flex: 1, margin: 0, fontSize: 13 }} />
              <button type="submit" disabled={!replyText.trim()} style={{ whiteSpace: 'nowrap', fontSize: 13 }}>שלח</button>
              <button type="button" className="btn-secondary" onClick={() => { setReplyOpen(false); setReplyText(''); }} style={{ whiteSpace: 'nowrap', fontSize: 13 }}>ביטול</button>
            </form>
          )}
        </div>
      </div>
      {c.replies?.length > 0 && (
        <div style={{ marginRight: 38, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {c.replies.map(r => <CommentItem key={r.id} c={r} postId={postId} user={user} onReload={onReload} />)}
        </div>
      )}
    </div>
  );
}

function CommentSection({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => api.get(`/posts/${postId}/comments`).then(setComments);

  useEffect(() => { if (open) load(); }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/posts/${postId}/comments`, { content: text });
    setText('');
    load();
  };

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 10 }}>
      <button className="btn-secondary" style={{ fontSize: 13, padding: '4px 12px' }} onClick={() => setOpen(o => !o)}>
        💬 {open ? 'הסתר תגובות' : 'הצג תגובות'}
      </button>
      {open && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {comments.map(c => <CommentItem key={c.id} c={c} postId={postId} user={user} onReload={load} />)}
          {user && (
            <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="כתוב תגובה..." style={{ flex: 1, margin: 0 }} />
              <button type="submit" disabled={!text.trim()} style={{ whiteSpace: 'nowrap' }}>שלח</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

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

  const startEdit = (post) => { setEditingId(post.id); setForm({ title: post.title, content: post.content }); };
  const cancelEdit = () => { setEditingId(null); setForm({ title: '', content: '' }); };

  const handleDelete = async (id) => {
    if (!confirm('למחוק את הפוסט?')) return;
    await api.delete(`/posts/${id}`);
    fetchPosts();
  };

  const handleLike = async (post, reaction) => {
    const isSame = post.my_reaction === reaction;
    const newReaction = isSame ? null : reaction;
    setPosts(ps => ps.map(p => p.id === post.id ? {
      ...p,
      my_reaction: newReaction,
      likes_count: p.likes_count
        + (newReaction === 'like' ? 1 : 0)
        - (p.my_reaction === 'like' ? 1 : 0),
      dislikes_count: p.dislikes_count
        + (newReaction === 'dislike' ? 1 : 0)
        - (p.my_reaction === 'dislike' ? 1 : 0),
    } : p));
    await api.post(`/posts/${post.id}/like`, { reaction: newReaction });
  };

  const canEdit = (post) => user?.id === post.instructor_id || user?.role === 'admin';
  const canDelete = (post) => user?.id === post.instructor_id || user?.role === 'admin';

  const formatDate = (dt) => new Date(dt).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-container">
      <h2>{editingId ? 'עריכת פוסט' : 'פוסטים'}</h2>

      {(user?.role === 'instructor' || user?.role === 'admin') && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <input placeholder="כותרת" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <textarea placeholder="תוכן הפוסט..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} required />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{editingId ? 'שמור' : 'פרסם'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={cancelEdit}>ביטול</button>}
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Avatar image={post.author_image} name={post.author_name} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{post.author_name}</span>
                    <h3 style={{ margin: '2px 0 0', fontSize: 16 }}>{post.title}</h3>
                  </div>
                  <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap', marginRight: 8 }}>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>

            <p style={{ margin: '0 0 12px', color: '#444', lineHeight: 1.6 }}>{post.content}</p>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  onClick={() => handleLike(post, 'like')}
                  style={{ fontSize: 18, padding: '4px 10px', background: post.my_reaction === 'like' ? '#e8f0fe' : '#f1f3f4', border: post.my_reaction === 'like' ? '2px solid #1a73e8' : '1px solid #ddd' }}
                >👍 <span style={{ fontSize: 13, color: '#555' }}>{post.likes_count || 0}</span></button>
                <button
                  onClick={() => handleLike(post, 'dislike')}
                  style={{ fontSize: 18, padding: '4px 10px', background: post.my_reaction === 'dislike' ? '#fdecea' : '#f1f3f4', border: post.my_reaction === 'dislike' ? '2px solid #e53935' : '1px solid #ddd' }}
                >👎 <span style={{ fontSize: 13, color: '#555' }}>{post.dislikes_count || 0}</span></button>
              </div>
              {canEdit(post) && <button onClick={() => startEdit(post)} style={{ background: '#fff8e1', color: '#f0a500', border: '1px solid #f0a500' }}>✏️ ערוך</button>}
              {canDelete(post) && <button onClick={() => handleDelete(post.id)} style={{ background: '#fdecea', color: '#e53935', border: '1px solid #e53935' }}>🗑️ מחק</button>}
            </div>

            <CommentSection postId={post.id} user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}
