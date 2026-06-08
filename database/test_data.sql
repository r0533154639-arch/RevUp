USE revup;

-- הוספת תלמידים לדוגמה
INSERT INTO users (name, email, phone, date_of_birth, role) VALUES
('יוסי כהן', 'yossi@example.com', '050-1234567', '1995-05-15', 'student'),
('שרה לוי', 'sara@example.com', '052-9876543', '1998-08-22', 'student'),
('דוד משה', 'david@example.com', '054-5555555', '1992-12-10', 'student');

-- הוספת סטטוס לתלמידים
INSERT INTO driving_students (user_id, status, vehicle_type_id) VALUES
((SELECT id FROM users WHERE email = 'yossi@example.com'), 'theory', 1),
((SELECT id FROM users WHERE email = 'sara@example.com'), 'lessons', 1),
((SELECT id FROM users WHERE email = 'david@example.com'), 'test', 1);

-- הוספת מורי נהיגה לדוגמה
INSERT INTO users (name, email, phone, date_of_birth, role) VALUES
('אבי רון', 'avi@example.com', '050-7777777', '1975-03-20', 'instructor'),
('מיכל גל', 'michal@example.com', '052-8888888', '1980-07-11', 'instructor');

-- הוספת פרטי מורי נהיגה
INSERT INTO driving_instructor (user_id, area) VALUES
((SELECT id FROM users WHERE email = 'avi@example.com'), 'תל אביב'),
((SELECT id FROM users WHERE email = 'michal@example.com'), 'חיפה');

-- הוספת פוסטים לדוגמה
INSERT INTO posts (instructor_id, title, content) VALUES
((SELECT id FROM users WHERE email = 'avi@example.com'), 'טיפים לנהיגה בעיר', 'כמה טיפים חשובים לנהיגה בטוחה בעיר...'),
((SELECT id FROM users WHERE email = 'michal@example.com'), 'התכוננות לטסט', 'איך להתכונן נכון לטסט הנהיגה...');

-- הוספת סוגי רכב
INSERT INTO vehicle_types (name) VALUES
('רכב פרטי'),
('אופנוע'),
('משאית');