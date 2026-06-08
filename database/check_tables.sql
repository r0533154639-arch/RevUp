-- בדיקה מה יש בטבלת המורים
DESCRIBE driving_instructor;

-- בדיקה מה יש בטבלת המשתמשים  
DESCRIBE users;

-- בדיקת המורים הקיימים
SELECT u.id, u.name, u.profile_image, u.role 
FROM users u 
WHERE u.role = 'instructor';