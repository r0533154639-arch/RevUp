-- CREATE DATABASE IF NOT EXISTS revup;
-- USE revup;

-- CREATE TABLE roles (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL UNIQUE
-- );

-- INSERT INTO roles (name) VALUES ('student'), ('instructor'), ('admin');

-- CREATE TABLE users (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL UNIQUE,
--   email VARCHAR(100) UNIQUE NOT NULL,
--   phone VARCHAR(20) NOT NULL,
--   date_of_birth DATE NOT NULL,
--   role_id INT NOT NULL DEFAULT 1,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (role_id) REFERENCES roles(id)
-- );

-- CREATE TABLE passwords (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   user_id INT UNIQUE NOT NULL,
--   password_hash VARCHAR(255) NOT NULL,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE student_statuses (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL UNIQUE
-- );

-- INSERT INTO student_statuses (name) VALUES ('theory'), ('lessons'), ('test'), ('licensed');

-- CREATE TABLE driving_students (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT UNIQUE NOT NULL,
--   status_id INT NOT NULL DEFAULT 1,
--   instructor_id INT DEFAULT NULL,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (status_id) REFERENCES student_statuses(id)
-- );

-- CREATE TABLE theory_progress (
--     student_id INT PRIMARY KEY,
--     total_demo_tests INT DEFAULT 0 CHECK (total_demo_tests BETWEEN 0 AND 4),
--     total_demo_questions INT DEFAULT 0,
--     FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE driving_instructor (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT UNIQUE NOT NULL,
--   area VARCHAR(100),
--   years_experience INT DEFAULT NULL,
--   profile_status ENUM('draft', 'pending', 'active') NOT NULL DEFAULT 'draft',
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE instructor_availability (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     instructor_id INT NOT NULL,
--     date DATE,
--     start_time TIME,
--     end_time TIME,
--     FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
-- );

-- CREATE TABLE lesson_statuses (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL UNIQUE
-- );

-- INSERT INTO lesson_statuses (name) VALUES ('pending'), ('approved'), ('unapproved'), ('completed'), ('cancelled');

-- CREATE TABLE driving_lessons (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   student_id INT NOT NULL,
--   instructor_id INT NOT NULL,
--   date DATE NOT NULL,
--   time TIME NOT NULL,
--   status_id INT NOT NULL DEFAULT 1,
--   FOREIGN KEY (student_id) REFERENCES users(id),
--   FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
--   FOREIGN KEY (status_id) REFERENCES lesson_statuses(id)
-- );

-- CREATE TABLE lessons_payments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     lesson_id INT NOT NULL,
--     amount DECIMAL(10,2) NOT NULL,
--     is_paid BOOLEAN NOT NULL DEFAULT FALSE,
--     payment_date DATETIME,
--     FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id)
-- );

-- CREATE TABLE feedback (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   lesson_id INT NOT NULL,
--   rating TINYINT CHECK (rating BETWEEN 1 AND 5),
--   comment TEXT,
--   FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id)
-- );

-- CREATE TABLE test_statuses (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL UNIQUE
-- );

-- INSERT INTO test_statuses (name) VALUES ('scheduled'), ('passed'), ('failed');

-- CREATE TABLE tests (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   student_id INT NOT NULL,
--   date DATE NOT NULL,
--   time TIME NOT NULL,
--   status_id INT NOT NULL DEFAULT 1,
--   FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (status_id) REFERENCES test_statuses(id)
-- );

-- CREATE TABLE appeals (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   test_id INT NOT NULL,
--   reason TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (test_id) REFERENCES tests(id)
-- );

-- CREATE TABLE posts (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   instructor_id INT NOT NULL,
--   title VARCHAR(200),
--   content TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE vehicle_types (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(50) NOT NULL
-- );

-- CREATE TABLE instructor_vehicle_types (
--   instructor_id INT NOT NULL,
--   vehicle_type_id INT NOT NULL,
--   PRIMARY KEY (instructor_id, vehicle_type_id),
--   FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
--   FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
-- );

-- ALTER TABLE driving_students
-- ADD vehicle_type_id INT NOT NULL DEFAULT 1,
-- ADD FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id);

-- CREATE TABLE test_centers (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100),
--     city VARCHAR(100),
--     address VARCHAR(255)
-- );

-- ALTER TABLE driving_instructor
-- ADD test_center_id INT DEFAULT NULL,
-- ADD FOREIGN KEY (test_center_id)
-- REFERENCES test_centers(id);

-- ALTER TABLE DrivingInstructor ADD photo VARCHAR(255);
-- CREATE VIEW student_progress_view AS
-- SELECT
--     s.user_id AS student_id,
--     ss.name AS status,
--     COUNT(l.id) AS total_lessons,
--     COALESCE(SUM(ls.name = 'completed'), 0) AS completed_lessons
-- FROM driving_students s
-- JOIN student_statuses ss ON ss.id = s.status_id
-- LEFT JOIN driving_lessons l ON l.student_id = s.user_id
-- LEFT JOIN lesson_statuses ls ON ls.id = l.status_id
-- GROUP BY s.user_id, ss.name;

-- -- לקשר מורה למכון רישוי

-- -- פידבק של המורה לתלמיד אחרי שיעור
-- CREATE TABLE lesson_feedback (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   lesson_id INT NOT NULL UNIQUE,
--   instructor_id INT NOT NULL,
--   student_id INT NOT NULL,
--   progress_rating TINYINT NOT NULL CHECK (progress_rating BETWEEN 1 AND 5),
--   notes TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id),
--   FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
--   FOREIGN KEY (student_id) REFERENCES driving_students(user_id)
-- );

-- CREATE TABLE post_likes (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   post_id INT NOT NULL,
--   user_id INT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE (post_id, user_id),
--   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE post_comments (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   post_id INT NOT NULL,
--   user_id INT NOT NULL,
--   content TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- דירוג של התלמיד על המורה בסוף התהליך או בעת מעבר למורה אחר
-- CREATE TABLE instructor_review (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   student_id INT NOT NULL,
--   instructor_id INT NOT NULL,
--   rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
--   comment TEXT,
--   is_completed BOOLEAN NOT NULL DEFAULT TRUE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE (student_id, instructor_id),
--   FOREIGN KEY (student_id) REFERENCES driving_students(user_id),
--   FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
-- );

CREATE DATABASE IF NOT EXISTS revup;
USE revup;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('student'), ('instructor'), ('admin');

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  role_id INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE passwords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE student_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO student_statuses (name) VALUES ('theory'), ('lessons'), ('test'), ('licensed');

CREATE TABLE driving_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  status_id INT NOT NULL DEFAULT 1,
  instructor_id INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES student_statuses(id)
);

CREATE TABLE theory_progress (
    student_id INT PRIMARY KEY,
    total_demo_tests INT DEFAULT 0 CHECK (total_demo_tests BETWEEN 0 AND 4),
    total_demo_questions INT DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE driving_instructor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  area VARCHAR(100),
  years_experience INT DEFAULT NULL,
  profile_status ENUM('draft', 'pending', 'active') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE instructor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    date DATE,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
);

CREATE TABLE lesson_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO lesson_statuses (name) VALUES ('pending'), ('approved'), ('unapproved'), ('completed'), ('cancelled');

CREATE TABLE driving_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status_id INT NOT NULL DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
  FOREIGN KEY (status_id) REFERENCES lesson_statuses(id)
);

CREATE TABLE lessons_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date DATETIME,
    FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id)
);

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id)
);

CREATE TABLE test_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO test_statuses (name) VALUES ('scheduled'), ('passed'), ('failed');

CREATE TABLE tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status_id INT NOT NULL DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES test_statuses(id)
);

CREATE TABLE appeals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE vehicle_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE instructor_vehicle_types (
  instructor_id INT NOT NULL,
  vehicle_type_id INT NOT NULL,
  PRIMARY KEY (instructor_id, vehicle_type_id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

ALTER TABLE driving_students
ADD vehicle_type_id INT NOT NULL DEFAULT 1,
ADD FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id);

CREATE TABLE test_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(255)
);

ALTER TABLE driving_instructor
ADD test_center_id INT DEFAULT NULL,
ADD FOREIGN KEY (test_center_id)
REFERENCES test_centers(id);

ALTER TABLE DrivingInstructor ADD photo VARCHAR(255);
CREATE VIEW student_progress_view AS
SELECT
    s.user_id AS student_id,
    ss.name AS status,
    COUNT(l.id) AS total_lessons,
    COALESCE(SUM(ls.name = 'completed'), 0) AS completed_lessons
FROM driving_students s
JOIN student_statuses ss ON ss.id = s.status_id
LEFT JOIN driving_lessons l ON l.student_id = s.user_id
LEFT JOIN lesson_statuses ls ON ls.id = l.status_id
GROUP BY s.user_id, ss.name;

-- לקשר מורה למכון רישוי

-- פידבק של המורה לתלמיד אחרי שיעור
CREATE TABLE lesson_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL UNIQUE,
  instructor_id INT NOT NULL,
  student_id INT NOT NULL,
  progress_rating TINYINT NOT NULL CHECK (progress_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
  FOREIGN KEY (student_id) REFERENCES driving_students(user_id)
);

CREATE TABLE post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE post_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- דירוג של התלמיד על המורה בסוף התהליך או בעת מעבר למורה אחר
CREATE TABLE instructor_review (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, instructor_id),
  FOREIGN KEY (student_id) REFERENCES driving_students(user_id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
);
USE revup;

ALTER TABLE driving_instructor
ADD COLUMN years_experience INT DEFAULT NULL,
ADD COLUMN profile_status ENUM('draft', 'pending', 'active')
NOT NULL DEFAULT 'draft';

USE revup;

-- תבנית שבועית קבועה של מורה: אילו slots הוא זמין בכל יום
CREATE TABLE IF NOT EXISTS instructor_weekly_template (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  slot_index TINYINT NOT NULL COMMENT '0=00:00, 1=00:45, 2=01:30, ... (45 min each)',
  UNIQUE KEY uq_instructor_day_slot (instructor_id, day_of_week, slot_index),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id) ON DELETE CASCADE
);

-- שינויים לתאריך ספציפי (מוסיף או מחסיר slots מהתבנית הכללית)
CREATE TABLE IF NOT EXISTS instructor_availability_override (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  slot_index TINYINT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE=הוסף slot, FALSE=חסום slot',
  UNIQUE KEY uq_override (instructor_id, date, slot_index),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id) ON DELETE CASCADE
);

-- עמודת status_id קיימת? נוודא שיש status מבוסס string ב-driving_lessons
ALTER TABLE driving_lessons 
  ADD COLUMN cancelled_by ENUM('student','instructor','admin') DEFAULT NULL;

ALTER TABLE driving_lessons 
  ADD COLUMN cancel_requested_by ENUM('student','instructor') DEFAULT NULL;
SELECT ds.user_id, ds.instructor_id, di.id, di.user_id AS instructor_user_id
FROM driving_students ds
LEFT JOIN driving_instructor di ON di.id = ds.instructor_id
WHERE ds.user_id = 29;

USE revup;

CREATE TABLE IF NOT EXISTS lesson_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO lesson_statuses (name) VALUES ('pending'), ('approved'), ('unapproved'), ('completed'), ('cancelled');

-- אם driving_lessons כבר קיימת עם status כ-string, נוסיף status_id
ALTER TABLE driving_lessons ADD COLUMN status_id INT DEFAULT NULL;

-- עדכן status_id לפי status הקיים אם יש
UPDATE driving_lessons dl
JOIN lesson_statuses ls ON ls.name = dl.status
SET dl.status_id = ls.id
WHERE dl.status_id IS NULL;

-- הוסף foreign key אם לא קיים (אופציונלי)
-- ALTER TABLE driving_lessons ADD FOREIGN KEY (status_id) REFERENCES lesson_statuses(id);
ALTER TABLE driving_lessons ADD COLUMN  cancel_rejected_by ENUM('student', 'instructor') DEFAULT NULL;

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
