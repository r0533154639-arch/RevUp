USE revup;

CREATE TABLE IF NOT EXISTS lesson_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO lesson_statuses (name) VALUES ('pending'), ('approved'), ('unapproved'), ('completed'), ('cancelled');

-- אם driving_lessons כבר קיימת עם status כ-string, נוסיף status_id
ALTER TABLE driving_lessons ADD COLUMN IF NOT EXISTS status_id INT DEFAULT NULL;

-- עדכן status_id לפי status הקיים אם יש
UPDATE driving_lessons dl
JOIN lesson_statuses ls ON ls.name = dl.status
SET dl.status_id = ls.id
WHERE dl.status_id IS NULL;

-- הוסף foreign key אם לא קיים (אופציונלי)
-- ALTER TABLE driving_lessons ADD FOREIGN KEY (status_id) REFERENCES lesson_statuses(id);
