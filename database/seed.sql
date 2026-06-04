USE revup;

INSERT IGNORE INTO vehicle_types (id, name) VALUES
(1, 'רכב פרטי'),
(2, 'אופנוע'),
(3, 'משאית'),
(4, 'אוטובוס');

INSERT IGNORE INTO users (name, email, phone, date_of_birth, role) VALUES
('דני לוי', 'danny@test.com', '050-0000001', '1985-03-15', 'instructor'),
('רחל כהן', 'rachel@test.com', '050-0000002', '1990-07-22', 'instructor'),
('יוסי מזרחי', 'yossi@test.com', '050-0000003', '2000-01-10', 'student');

INSERT IGNORE INTO driving_instructor (user_id, area) VALUES
(1, 'תל אביב'),
(2, 'ירושלים');

INSERT IGNORE INTO driving_students (user_id, status, vehicle_type_id) VALUES
(3, 'theory', 1);
