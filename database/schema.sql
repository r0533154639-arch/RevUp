CREATE DATABASE IF NOT EXISTS revup;
USE revup;

CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
INSERT IGNORE INTO user_roles (name) VALUES ('student'), ('instructor'), ('admin');

CREATE TABLE IF NOT EXISTS student_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
INSERT IGNORE INTO student_statuses (name) VALUES ('theory'), ('lessons'), ('test'), ('licensed');

CREATE TABLE IF NOT EXISTS lesson_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
INSERT IGNORE INTO lesson_statuses (name) VALUES ('pending'), ('approved'), ('unapproved'), ('completed'), ('cancelled');

CREATE TABLE IF NOT EXISTS test_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
INSERT IGNORE INTO test_statuses (name) VALUES ('scheduled'), ('passed'), ('failed');

CREATE TABLE IF NOT EXISTS vehicle_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);
INSERT IGNORE INTO vehicle_types (name) VALUES ('רכב פרטי'), ('אופנוע'), ('משאית'),('אוטובוס');

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  role_id INT NOT NULL DEFAULT 1,
  profile_image VARCHAR(255) DEFAULT NULL,
  area VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES user_roles(id)
);

CREATE TABLE IF NOT EXISTS passwords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driving_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  status_id INT DEFAULT 1,
  instructor_id INT DEFAULT NULL,
  vehicle_type_id INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES student_statuses(id),
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

CREATE TABLE IF NOT EXISTS theory_progress (
  student_id INT PRIMARY KEY,
  total_demo_tests INT DEFAULT 0 CHECK (total_demo_tests BETWEEN 0 AND 4),
  total_demo_questions INT DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driving_instructor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  area VARCHAR(100),
  years_experience INT DEFAULT NULL,
  profile_status VARCHAR(20) NOT NULL DEFAULT 'draft',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instructor_vehicle_types (
  instructor_id INT NOT NULL,
  vehicle_type_id INT NOT NULL,
  PRIMARY KEY (instructor_id, vehicle_type_id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

CREATE TABLE IF NOT EXISTS instructor_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  date DATE,
  start_time TIME,
  end_time TIME,
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
);

CREATE TABLE IF NOT EXISTS instructor_weekly_template (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  slot_index TINYINT NOT NULL COMMENT '0=00:00, 1=00:45, 2=01:30, ... (45 min each)',
  UNIQUE KEY uq_instructor_day_slot (instructor_id, day_of_week, slot_index),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instructor_availability_override (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  slot_index TINYINT NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_override (instructor_id, date, slot_index),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driving_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status_id INT DEFAULT 1,
  cancelled_by VARCHAR(20) DEFAULT NULL,
  cancel_requested_by VARCHAR(20) DEFAULT NULL,
  cancel_rejected_by VARCHAR(20) DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id),
  FOREIGN KEY (status_id) REFERENCES lesson_statuses(id)
);

CREATE TABLE IF NOT EXISTS lessons_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_paid TINYINT(1) NOT NULL DEFAULT 0,
  payment_date DATETIME,
  FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  FOREIGN KEY (lesson_id) REFERENCES driving_lessons(id)
);

CREATE TABLE IF NOT EXISTS lesson_feedback (
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

CREATE TABLE IF NOT EXISTS tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status_id INT DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES test_statuses(id)
);

CREATE TABLE IF NOT EXISTS appeals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instructor_review (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_completed TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, instructor_id),
  FOREIGN KEY (student_id) REFERENCES driving_students(user_id),
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id)
);

CREATE TABLE IF NOT EXISTS instructor_student_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_instructor_student_requests_student_id (student_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  status ENUM('pending', 'scheduled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_test_requests_student_id (student_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (instructor_id) REFERENCES driving_instructor(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) DEFAULT NULL,
  entity_id INT DEFAULT NULL,
  details JSON DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);
