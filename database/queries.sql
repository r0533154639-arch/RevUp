USE revup;

-- אחוז התקדמות תלמיד
SELECT student_id, completed_lessons, total_lessons,
  ROUND(completed_lessons / NULLIF(total_lessons, 0) * 100, 1) AS progress_pct
FROM StudentProgress;

-- סטטיסטיקות מעבר לפי מורה
SELECT i.id, u.name, COUNT(t.id) AS total_tests,
  SUM(t.status = 'passed') AS passed,
  ROUND(SUM(t.status = 'passed') / COUNT(t.id) * 100, 1) AS pass_rate
FROM Instructors i
JOIN Users u ON u.id = i.user_id
JOIN Lessons l ON l.instructor_id = i.id
JOIN Tests t ON t.student_id = l.student_id
GROUP BY i.id;

-- תלמידים שמוכנים לטסט (20+ שיעורים שהושלמו)
SELECT sp.student_id, u.name, sp.completed_lessons
FROM StudentProgress sp
JOIN Users u ON u.id = sp.student_id
WHERE sp.completed_lessons >= 20 AND sp.theory_passed = TRUE;
