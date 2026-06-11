import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const send = (to, subject, html) => {
  console.log('[MAILER] sending to:', to, '| MAIL_USER:', process.env.MAIL_USER, '| MAIL_PASS set:', !!process.env.MAIL_PASS);
  return transporter.sendMail({ from: `"RevUp" <${process.env.MAIL_USER}>`, to, subject, html })
    .then(info => console.log('[MAILER] sent:', info.messageId))
    .catch(err => console.error('[MAILER] ERROR:', err.message));
};

export const sendWelcomeEmail = (to, name) =>
  send(to, 'ברוך הבא ל-RevUp! 🎉', `
    <div dir="rtl" style="font-family:Arial,sans-serif">
      <h2>שלום ${name}!</h2>
      <p>הרישום שלך ל-RevUp הושלם בהצלחה.</p>
      <p>אנו שמחים שהצטרפת אלינו ומאחלים לך הצלחה בלימודי הנהיגה!</p>
    </div>
  `);

export const sendLessonApprovedEmail = (to, studentName, date, time) =>
  send(to, 'השיעור שלך אושר ✅', `
    <div dir="rtl" style="font-family:Arial,sans-serif">
      <h2>שלום ${studentName}!</h2>
      <p>המורה שלך אישר את השיעור הבא:</p>
      <p><strong>תאריך:</strong> ${new Date(date).toLocaleDateString('he-IL')}</p>
      <p><strong>שעה:</strong> ${time}</p>
      <p>בהצלחה!</p>
    </div>
  `);

export const sendStudentEnrolledEmail = (to, instructorName, studentName) =>
  send(to, `תלמיד חדש נרשם אצלך 🎓`, `
    <div dir="rtl" style="font-family:Arial,sans-serif">
      <h2>שלום ${instructorName}!</h2>
      <p>התלמיד <strong>${studentName}</strong> נרשם אצלך כתלמיד.</p>
      <p>תוכל לצפות בפרטיו בלוח הבקרה שלך.</p>
    </div>
  `);

export const sendLessonScheduledEmail = (to, instructorName, studentName, date, time) =>
  send(to, 'שיעור חדש ממתין לאישורך 📅', `
    <div dir="rtl" style="font-family:Arial,sans-serif">
      <h2>שלום ${instructorName}!</h2>
      <p>התלמיד <strong>${studentName}</strong> קבע שיעור וממתין לאישורך:</p>
      <p><strong>תאריך:</strong> ${new Date(date).toLocaleDateString('he-IL')}</p>
      <p><strong>שעה:</strong> ${time}</p>
      <p>אנא היכנס למערכת כדי לאשר או לדחות את השיעור.</p>
    </div>
  `);

export const sendLicensedEmail = (to, name) =>
  send(to, 'מזל טוב! עברת את הטסט 🏆', `
    <div dir="rtl" style="font-family:Arial,sans-serif">
      <h2>מזל טוב ${name}!</h2>
      <p>אנו שמחים לבשר לך שעברת את טסט הנהיגה בהצלחה!</p>
      <p>ברוך הבא לעולם הנהגים המורשים 🚗</p>
    </div>
  `);
