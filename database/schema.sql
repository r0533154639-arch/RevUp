CREATE DATABASE IF NOT EXISTS revup;
USE revup;

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  status ENUM('theory', 'lessons', 'test', 'licensed') DEFAULT 'theory',
  theory_passed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Instructors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  area VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (student_id) REFERENCES Users(id),
  FOREIGN KEY (instructor_id) REFERENCES Instructors(id)
);

CREATE TABLE Feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(id)
);

CREATE TABLE Tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(150),
  status ENUM('scheduled', 'passed', 'failed') DEFAULT 'scheduled',
  FOREIGN KEY (student_id) REFERENCES Users(id)
);

CREATE TABLE Appeals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES Tests(id)
);

CREATE TABLE Posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE VIEW StudentProgress AS
SELECT s.user_id AS student_id,
  s.status,
  s.theory_passed,
  COUNT(l.id) AS total_lessons,
  SUM(l.status = 'completed') AS completed_lessons
FROM Students s
LEFT JOIN Lessons l ON l.student_id = s.user_id
GROUP BY s.user_id;
