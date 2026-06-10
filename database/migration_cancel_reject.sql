USE revup;
ALTER TABLE driving_lessons ADD COLUMN IF NOT EXISTS cancel_rejected_by ENUM('student', 'instructor') DEFAULT NULL;
