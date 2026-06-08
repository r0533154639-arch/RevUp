import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', token ? 'exists' : 'missing');
      const res = await fetch('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        return;
      }
      const data = await res.json();
      console.log('Users data:', data);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const toggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      const newBlockStatus = !currentlyBlocked;
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: newBlockStatus })
      });

      if (res.ok) {
        fetchUsers(); // רענון הרשימה
        alert(newBlockStatus ? 'המשתמש נחסם בהצלחה' : 'החסימה הוסרה בהצלחה');
      } else {
        alert('שגיאה בעדכון סטטוס המשתמש');
      }
    } catch (err) {
      console.error('Error toggling user block:', err);
      alert('שגיאה בעדכון סטטוס המשתמש');
    }
  };

  const getRoleInHebrew = (role) => {
    switch (role) {
      case 'student': return 'תלמיד';
      case 'instructor': return 'מורה';
      case 'admin': return 'אדמין';
      default: return role;
    }
  };

  return (
    <div className="admin-users">
      <h2>ניהול משתמשים</h2>
      <table>
        <thead>
          <tr>
            <th>שם</th>
            <th>אימייל</th>
            <th>תפקיד</th>
            <th>סטטוס</th>
            <th>תאריך הצטרפות</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={user.is_blocked ? 'blocked-user' : ''}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{getRoleInHebrew(user.role)}</td>
              <td>
                <span className={`status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                  {user.is_blocked ? 'חסום' : 'פעיל'}
                </span>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString('he-IL')}</td>
              <td>
                <button 
                  className={`block-btn ${user.is_blocked ? 'unblock' : 'block'}`}
                  onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                >
                  {user.is_blocked ? 'בטל חסימה' : 'חסום'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}