USE revup;

INSERT IGNORE INTO vehicle_types (id, name) VALUES
(1, 'רכב פרטי'),
(2, 'אופנוע'),
(3, 'משאית'),
(4, 'אוטובוס');

-- מורים
INSERT IGNORE INTO users (id, name, email, phone, date_of_birth, role) VALUES
(1, 'דני לוי', 'danny@test.com', '050-0000001', '1985-03-15', 'instructor'),
(2, 'רחל כהן', 'rachel@test.com', '050-0000002', '1990-07-22', 'instructor');

INSERT IGNORE INTO driving_instructor (id, user_id, area) VALUES
(1, 1, 'תל אביב'),
(2, 2, 'ירושלים');

INSERT IGNORE INTO passwords (user_id, password_hash) VALUES
(1, '$2b$10$examplehashinstructor1'),
(2, '$2b$10$examplehashinstructor2');

-- תלמידים
INSERT IGNORE INTO users (id, name, email, phone, date_of_birth, role) VALUES
(3, 'יוסי מזרחי',  'yossi@test.com',  '050-1111111', '2004-01-10', 'student'),
(4, 'מיכל ברנר',   'michal@test.com',  '050-2222222', '2003-06-18', 'student'),
(5, 'אור שפירא',   'or@test.com',      '050-3333333', '2005-03-05', 'student'),
(6, 'נועה גולדברג', 'noa@test.com',     '050-4444444', '2004-11-22', 'student'),
(7, 'תום כץ',      'tom@test.com',     '050-5555555', '2003-08-14', 'student');

INSERT IGNORE INTO passwords (user_id, password_hash) VALUES
(3, '$2b$10$examplehashstudent3'),
(4, '$2b$10$examplehashstudent4'),
(5, '$2b$10$examplehashstudent5'),
(6, '$2b$10$examplehashstudent6'),
(7, '$2b$10$examplehashstudent7');

-- תלמידים מקושרים למורה דני (instructor_id = 1)
INSERT IGNORE INTO driving_students (user_id, status, vehicle_type_id, instructor_id) VALUES
(3, 'theory',   1, 1),
(4, 'lessons',  1, 1),
(5, 'test',     1, 1),
(6, 'licensed', 1, 1),
(7, 'lessons',  2, 1);
INSERT INTO users (id, name, email, phone, date_of_birth, role)
VALUES
(
    1,
    'Admin',
    'admin@mail.com',
    '050-0000000',
    '1980-01-01',
    'admin'
);
INSERT INTO passwords (user_id, password_hash)
VALUES (
    1,
    '$2b$10$cc8uwm2UeHNW//64WYoJ4.3g2NfEs/Yf67aORYJ7j1FhaSh1dvQ1S'
);
