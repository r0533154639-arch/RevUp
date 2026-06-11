import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const SERVER = 'http://localhost:3000';

function Avatar({ image, name, size = 40 }) {
  if (image) {
    return <img src={`${SERVER}/uploads/${image}`} alt={name} className="avatar" style={{ width: size, height: size }} />;
  }
  return (
    <div className="avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name?.[0]}
    </div>
  );
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
      <div className="comment-item">
        <Avatar image={c.author_image} name={c.author_name} size={30} />
        <div className="comment-body">
          <span className="comment-author">{c.author_name}</span>
          <p className="comment-text">{c.content}</p>
          <div className="comment-footer">
            <span className="comment-time">{new Date(c.created_at).toLocaleString('he-IL')}</span>
            {user && <button className="btn-icon" onClick={() => setReplyOpen(o => !o)}>↩ הגב</button>}
            {canDelete && <button className="btn-icon-danger" onClick={remove}>מחק</button>}
          </div>
          {replyOpen && (
            <form onSubmit={submitReply} className="reply-form">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`השב ל${c.author_name}...`} />
              <button type="submit" disabled={!replyText.trim()}>שלח</button>
              <button type="button" className="btn-secondary" onClick={() => { setReplyOpen(false); setReplyText(''); }}>ביטול</button>
            </form>
          )}
        </div>
      </div>
      {c.replies?.length > 0 && (
        <div className="comment-replies">
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
    <div className="comments-section">
      <button className="btn-secondary" style={{ fontSize: 13, padding: '4px 12px' }} onClick={() => setOpen(o => !o)}>
        💬 {open ? 'הסתר תגובות' : 'הצג תגובות'}
      </button>
      {open && (
        <div className="comments-list">
          {comments.map(c => <CommentItem key={c.id} c={c} postId={postId} user={user} onReload={load} />)}
          {user && (
            <form onSubmit={submit} className="comment-submit-form">
              <input value={text} onChange={e => setText(e.target.value)} placeholder="כתוב תגובה..." />
              <button type="submit" disabled={!text.trim()}>שלח</button>
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
      likes_count: p.likes_count + (newReaction === 'like' ? 1 : 0) - (p.my_reaction === 'like' ? 1 : 0),
      dislikes_count: p.dislikes_count + (newReaction === 'dislike' ? 1 : 0) - (p.my_reaction === 'dislike' ? 1 : 0),
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
        <form onSubmit={handleSubmit} className="posts-form">
          <input placeholder="כותרת" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <textarea placeholder="תוכן הפוסט..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} required />
          <div className="btn-row">
            <button type="submit">{editingId ? 'שמור' : 'פרסם'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={cancelEdit}>ביטול</button>}
          </div>
        </form>
      )}

      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-card-header">
              <Avatar image={post.author_image} name={post.author_name} size={44} />
              <div className="post-card-meta">
                <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="post-author">{post.author_name}</span>
                    <h3 className="post-title">{post.title}</h3>
                  </div>
                  <span className="post-date">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>

            <p className="post-content">{post.content}</p>

            <div className="post-actions">
              <div className="btn-row">
                <button
                  className={`reaction-btn ${post.my_reaction === 'like' ? 'active-like' : ''}`}
                  onClick={() => handleLike(post, 'like')}
                >👍 <span className="reaction-count">{post.likes_count || 0}</span></button>
                <button
                  className={`reaction-btn ${post.my_reaction === 'dislike' ? 'active-dislike' : ''}`}
                  onClick={() => handleLike(post, 'dislike')}
                >👎 <span className="reaction-count">{post.dislikes_count || 0}</span></button>
              </div>
              {canEdit(post) && <button className="btn-warning" onClick={() => startEdit(post)}>✏️ ערוך</button>}
              {canDelete(post) && <button className="btn-danger" onClick={() => handleDelete(post.id)}>🗑️ מחק</button>}
            </div>

            <CommentSection postId={post.id} user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}
