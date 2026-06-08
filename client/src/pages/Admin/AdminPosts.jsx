import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/admin.css';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  return (
    <div className="admin-posts">
      <h2>כל הפוסטים</h2>
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>מאת: {post.instructor_name}</p>
            <p>{post.content}</p>
            <small>נוצר בתאריך: {new Date(post.created_at).toLocaleDateString('he-IL')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}