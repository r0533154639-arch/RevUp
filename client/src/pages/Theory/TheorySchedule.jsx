import { useNavigate } from 'react-router-dom';

export default function TheorySchedule() {
    const navigate = useNavigate();

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
        </div>
    );
}
