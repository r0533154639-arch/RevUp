USE revup;

ALTER TABLE driving_instructor 
  ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS profile_status ENUM('draft', 'pending', 'active') NOT NULL DEFAULT 'draft';
