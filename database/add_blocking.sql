-- הוספת עמודה לחסימת משתמשים
ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;