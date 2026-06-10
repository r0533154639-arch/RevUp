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
-- מוסיפים עמודת cancelled_by ו-cancel_requested_by לתמיכה בביטול
ALTER TABLE driving_lessons 
  ADD COLUMN IF NOT EXISTS cancelled_by ENUM('student','instructor','admin') DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancel_requested_by ENUM('student','instructor') DEFAULT NULL;
