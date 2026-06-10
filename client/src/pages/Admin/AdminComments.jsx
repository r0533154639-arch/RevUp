import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/admin.css';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/comments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  return (
    <div className="admin-comments">
      <h2>כל התגובות</h2>
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-card">
            <h4>דירוג: {comment.rating}/5</h4>
            <p>{comment.comment}</p>
            <small>על השיעור מתאריך: {new Date(comment.lesson_date).toLocaleDateString('he-IL')}</small>
            <small>בין {comment.student_name} למורה {comment.instructor_name}</small>
          </div>
        ))}
      </div>
    </div>
  );
}