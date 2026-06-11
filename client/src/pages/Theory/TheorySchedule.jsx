import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { updateStudentStatus } from '../../services/stats.service.js';

export default function TheorySchedule() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handlePassedTheory = async () => {
        setLoading(true);
        try {
            await updateStudentStatus(undefined, 'lessons');
            navigate(`/users/${user.id}/instructors`);
        } catch {
            alert('שגיאה בעדכון הסטטוס');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ direction: 'rtl', maxWidth: 600 }}>
            <h2>קביעת מבחן תאוריה</h2>
            <p>
                לאחר שסיימתם ללמוד ולתרגל, הגיע הזמן להיבחן:)<br />
                מבחן התאוריה כולל שאלות בנושאי תמרורים, חוקי תנועה, בטיחות בדרכים והתנהגות נכונה בכביש. המבחן נערך באופן ממוחשב ומעבר שלו הוא תנאי להתחלת ההכשרה המעשית בדרך לקבלת רישיון הנהיגה.
            </p>
            <p>
                מומלץ לתרגל מספר מבחנים מלאים באתר לפני קביעת מועד הבחינה כדי להגדיל את סיכויי ההצלחה כבר בניסיון הראשון.
            </p>
            <p>
                <a href="https://www.theorytest.org.il/#snifim" target="_blank" rel="noreferrer"> לקביעת מבחן התאוריה</a>
            </p>
            <p>בהצלחה!!!</p>
            <button onClick={handlePassedTheory} disabled={loading} style={{ marginTop: 16 }}>
                {loading ? '...' : '✅ עברתי תאוריה'}
            </button>
        </div>
    );
}
