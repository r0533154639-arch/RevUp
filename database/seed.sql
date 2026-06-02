USE revup;

INSERT INTO vehicle_types (id, name) VALUES
(1, 'רכב פרטי'),
(2, 'אופנוע'),
(3, 'משאית'),
(4, 'אוטובוס');

-- INSERT INTO Users (name, email, password, role) VALUES
('דני לוי', 'danny@test.com', '$2b$10$placeholder_hash', 'instructor'),
('רחל כהן', 'rachel@test.com', '$2b$10$placeholder_hash', 'instructor'),
('יוסי מזרחי', 'yossi@test.com', '$2b$10$placeholder_hash', 'student');

INSERT INTO Instructors (user_id, area, rating) VALUES
(1, 'תל אביב', 4.8),
(2, 'ירושלים', 4.5);

INSERT INTO Students (user_id, status) VALUES (3, 'theory');
