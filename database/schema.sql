CREATE DATABASE IF NOT EXISTS revup;
USE revup;

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passwords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE DrivingStudents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  status ENUM('theory', 'lessons', 'test', 'licensed') DEFAULT 'theory',
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE DrivingInstructor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  area VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE DrivingLessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('pending', 'approved', 'unapproved' ,'completed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (student_id) REFERENCES users(user_id),
  FOREIGN KEY (instructor_id) REFERENCES DrivingInstructor(user_id)
);

CREATE TABLE Feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  FOREIGN KEY (lesson_id) REFERENCES DrivingLessons(id)
);

CREATE TABLE Tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  -- location VARCHAR(150),
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
  FOREIGN KEY (instructor_id) REFERENCES Users(id)
);

CREATE TABLE VehicleTypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE InstructorVehicleTypes (
  instructor_id INT NOT NULL,
  vehicle_type_id INT NOT NULL,
  PRIMARY KEY (instructor_id, vehicle_type_id),
  FOREIGN KEY (instructor_id) REFERENCES DrivingInstructor(user_id),
  FOREIGN KEY (vehicle_type_id) REFERENCES VehicleTypes(id)
);

ALTER TABLE DrivingStudents
ADD vehicle_type_id INT NOT NULL;

ALTER TABLE DrivingStudents
ADD FOREIGN KEY (vehicle_type_id)
REFERENCES VehicleTypes(id);

CREATE TABLE LicensingOffice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(255) NOT NULL
);

ALTER TABLE DrivingInstructor
ADD licensing_office_id INT NOT NULL;

ALTER TABLE DrivingInstructor
ADD FOREIGN KEY (licensing_office_id)
REFERENCES LicensingOffice(id);

CREATE VIEW StudentProgress AS
SELECT s.user_id AS student_id,
  s.status,
  s.theory_passed,
  COUNT(l.id) AS total_lessons,
  SUM(l.status = 'completed') AS completed_lessons
FROM DrivingStudents s
LEFT JOIN DrivingLessons l ON l.student_id = s.user_id
GROUP BY s.user_id;



--לקשר מורה למכון רישוי

-- פידבק של המורה לתלמיד אחרי שיעור
CREATE TABLE LessonFeedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL UNIQUE,
  instructor_id INT NOT NULL,
  student_id INT NOT NULL,
  progress_rating TINYINT NOT NULL CHECK (progress_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES DrivingLessons(id),
  FOREIGN KEY (instructor_id) REFERENCES DrivingInstructor(user_id),
  FOREIGN KEY (student_id) REFERENCES DrivingStudents(user_id)
);

-- דירוג של התלמיד על המורה בסוף התהליך או בעת מעבר למורה אחר
CREATE TABLE InstructorReview (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  instructor_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  trigger ENUM('completed', 'transferred') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, instructor_id),
  FOREIGN KEY (student_id) REFERENCES DrivingStudents(user_id),
  FOREIGN KEY (instructor_id) REFERENCES DrivingInstructor(user_id)
);