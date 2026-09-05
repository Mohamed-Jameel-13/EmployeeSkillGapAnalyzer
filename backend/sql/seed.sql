-- ============================================================
-- EMPLOYEE / STUDENT SKILL GAP ANALYZER
-- Demo Seed Data for MySQL
-- ============================================================

USE skill_gap_analyzer;

-- Clear any existing seed records in reverse dependency order
DELETE FROM recommendations;
DELETE FROM applications;
DELETE FROM job_skills;
DELETE FROM student_skills;
DELETE FROM jobs;
DELETE FROM skills;
DELETE FROM students;

-- Reset AUTO_INCREMENT counters
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE skills AUTO_INCREMENT = 1;
ALTER TABLE jobs AUTO_INCREMENT = 1;
ALTER TABLE applications AUTO_INCREMENT = 1;
ALTER TABLE recommendations AUTO_INCREMENT = 1;

-- 1. Insert Initial Users
-- Passwords are hashed with PBKDF2WithHmacSHA256 (password: 'password')
-- Admin User (ID 1)
INSERT INTO students (student_id, name, email, password_hash, role)
VALUES (1, 'Admin', 'admin@example.com', 'b9ed57e2e602048e0c31f54b0a9aa445:66c94037e142a30f94c2bb44e9ac4a976f9355dd7df16a460abe9bc2a010cd1d', 'ADMIN');

-- Student User Arun (ID 101)
INSERT INTO students (student_id, name, email, password_hash, role)
VALUES (101, 'Arun', 'arun@example.com', 'b9ed57e2e602048e0c31f54b0a9aa445:66c94037e142a30f94c2bb44e9ac4a976f9355dd7df16a460abe9bc2a010cd1d', 'USER');

-- Additional sample student (ID 102)
INSERT INTO students (student_id, name, email, password_hash, role)
VALUES (102, 'Priya', 'priya@example.com', 'b9ed57e2e602048e0c31f54b0a9aa445:66c94037e142a30f94c2bb44e9ac4a976f9355dd7df16a460abe9bc2a010cd1d', 'USER');

-- 2. Insert Skills Catalog
INSERT INTO skills (skill_id, name, category) VALUES
(10, 'Java', 'Backend'),
(11, 'MySQL', 'Database'),
(12, 'Spring Boot', 'Backend'),
(13, 'Python', 'Backend'),
(14, 'AWS', 'Cloud'),
(15, 'React', 'Frontend'),
(16, 'Docker', 'DevOps'),
(17, 'Git', 'Tools');

-- 3. Insert Arun's Skills (student_id = 101)
-- Notice: Spring Boot (12) is omitted intentionally (missing skill -> level 0 in skill-gap analysis)
INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES
(101, 10, 4), -- Java: 4 (Advanced)
(101, 11, 4), -- MySQL: 4 (Advanced)
(101, 13, 3), -- Python: 3 (Intermediate)
(101, 15, 2), -- React: 2 (Basic)
(101, 14, 1); -- AWS: 1 (Beginner)

-- Sample skills for Priya (student_id = 102)
INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES
(102, 10, 3),
(102, 12, 3),
(102, 15, 4);

-- 4. Insert Jobs
INSERT INTO jobs (job_id, title, company, location) VALUES
(501, 'Java Full Stack Developer', 'ABC Technologies', 'Chennai'),
(502, 'Backend Engineer', 'CloudScale Systems', 'Bengaluru'),
(503, 'Frontend Developer', 'WebCraft Studios', 'Hyderabad');

-- 5. Insert Job Skills Requirements for Job 501 (Java Full Stack Developer)
INSERT INTO job_skills (job_id, skill_id, required_level, mandatory) VALUES
(501, 10, 4, TRUE),  -- Java: 4 (Mandatory)
(501, 12, 4, TRUE),  -- Spring Boot: 4 (Mandatory)
(501, 15, 3, TRUE),  -- React: 3 (Mandatory)
(501, 11, 3, TRUE),  -- MySQL: 3 (Mandatory)
(501, 14, 2, FALSE); -- AWS: 2 (Optional)

-- Job Skills for Job 502 (Backend Engineer)
INSERT INTO job_skills (job_id, skill_id, required_level, mandatory) VALUES
(502, 10, 4, TRUE),
(502, 12, 4, TRUE),
(502, 11, 4, TRUE),
(502, 16, 2, FALSE);

-- Job Skills for Job 503 (Frontend Developer)
INSERT INTO job_skills (job_id, skill_id, required_level, mandatory) VALUES
(503, 15, 4, TRUE),
(503, 17, 3, TRUE);
