import { useState } from 'react';

const SECTIONS = [
  {
    id: 'documents',
    icon: '📄',
    title: 'מסמכים ורישוי',
    items: [
      { text: 'אתר רשות הרישוי – הנפקת רישיון נהיגה', href: 'https://www.gov.il/he/departments/topics/driving_license' },
      { text: 'חידוש רישיון רכב (טופס רב-שירות)', href: 'https://www.gov.il/he/service/renewing_a_vehicle_license' },
      { text: 'ביטוח חובה – השוואת מחירים (Insurance.co.il)', href: 'https://www.insurance.co.il' },
      { text: 'Goodi – השוואת ביטוח רכב מקיף/צד ג׳', href: 'https://www.goodi.co.il' },
      { text: 'כל מה שצריך לדעת על רישיון נהיגה חדש (gov.il)', href: 'https://www.gov.il/he/departments/topics/new_driver' },
    ],
  },
  {
    id: 'rules',
    icon: '📋',
    title: 'חוקי נהג חדש',
    items: [
      { text: 'חוקי נהג חדש – אתר משרד התחבורה הרשמי', href: 'https://www.gov.il/he/departments/topics/new_driver_rules' },
      { text: 'מגבלות מהירות לנהגים חדשים (ויקיפדיה עברית)', href: 'https://he.wikipedia.org/wiki/%D7%A0%D7%94%D7%92_%D7%97%D7%93%D7%A9_%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C' },
      { text: 'עבירות תנועה וקנסות – מדריך מלא (Takanot.com)', href: 'https://www.takanot.com' },
      { text: 'אפליקציית Waze – ניווט חכם בזמן אמת', href: 'https://www.waze.com' },
      { text: 'אפליקציית Moovit – תחבורה ציבורית', href: 'https://moovit.com' },
    ],
  },
  {
    id: 'car',
    icon: '🚗',
    title: 'השכרה ורכישת רכב',
    items: [
      { text: 'Yad2 רכבים – רכב יד שנייה', href: 'https://www.yad2.co.il/vehicles/cars' },
      { text: 'AutoNet – חיפוש רכבים יד שנייה', href: 'https://www.autonet.co.il' },
      { text: 'Shlomo Sixt – השכרת רכב', href: 'https://www.shlomo.co.il' },
      { text: 'Eldan – השכרת רכב', href: 'https://www.eldan.co.il' },
      { text: 'Budget Israel – השכרת רכב', href: 'https://www.budget.co.il' },
      { text: 'Goodi – ביטוח רכב מהיר ומשתלם', href: 'https://www.goodi.co.il' },
    ],
  },
  {
    id: 'tips',
    icon: '💡',
    title: 'טיפים ואפליקציות שימושיות',
    items: [
      { text: 'Waze – ניווט עם עדכוני תנועה בזמן אמת', href: 'https://www.waze.com' },
      { text: 'Google Maps – ניווט וחיפוש מסלולים', href: 'https://maps.google.com' },
      { text: 'Menta – תחנות דלק זולות בסביבה', href: 'https://menta.co.il' },
      { text: 'מוקד תאונות דרכים – מה לעשות בתאונה (AIG)', href: 'https://www.aig.co.il/car-accident' },
      { text: 'בדיקת רכב לפני קנייה – מדריך (Yad2)', href: 'https://magazine.yad2.co.il/vehicles/' },
      { text: 'פאנצ׳ר? מדריך להחלפת גלגל (YouTube)', href: 'https://www.youtube.com/results?search_query=%D7%94%D7%97%D7%9C%D7%A4%D7%AA+%D7%92%D7%9C%D7%92%D7%9C+%D7%A4%D7%A0%D7%A6%D7%A8' },
    ],
  },
];

function AccordionSection({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`nd-section ${open ? 'nd-section-open' : ''}`}>
      <button className="nd-section-header" onClick={() => setOpen(o => !o)}>
        <span className="nd-section-icon">{section.icon}</span>
        <span className="nd-section-title">{section.title}</span>
        <span className="nd-section-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="nd-section-body">
          {section.items.map((item, i) => (
            <li key={i} className="nd-section-item">
              <span className="nd-item-dot">•</span>
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="nd-link">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NewDriverDashboard() {
  return (
    <div className="page-container nd-page">
      <div className="nd-hero">
        <span className="nd-hero-icon">🎉</span>
        <div>
          <h2>ברוך הבא לעולם הנהיגה!</h2>
          <p className="text-muted">עברת את הטסט – עכשיו הכל מתחיל. כאן תמצא את כל מה שצריך לדעת.</p>
        </div>
      </div>
      <div className="nd-sections">
        {SECTIONS.map(s => <AccordionSection key={s.id} section={s} />)}
      </div>
    </div>
  );
}
