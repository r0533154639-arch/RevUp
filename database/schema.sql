CREATE DATABASE IF NOT EXISTS revup;
USE revup;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passwords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE driving_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  status ENUM('theory', 'lessons', 'test', 'licensed') DEFAULT 'theory',
  instructor_id INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

CREATE TABLE driving_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('pending', 'approved', 'unapproved', 'completed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
);

CREATE TABLE lessons_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid') DEFAULT 'pending',
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

CREATE TABLE tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('scheduled', 'passed', 'failed') DEFAULT 'scheduled',
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
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
    s.status,
    COUNT(l.id) AS total_lessons,
    COALESCE(SUM(l.status = 'completed'), 0) AS completed_lessons
FROM driving_students s
LEFT JOIN driving_lessons l
    ON l.student_id = s.user_id
GROUP BY s.user_id, s.status;

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
  reason ENUM('completed', 'transferred') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, instructor_id),
  FOREIGN KEY (student_id) REFERENCES driving_students(user_id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
);
