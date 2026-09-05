# Database Contract & Repository Mapping Specification

**Target Audience**: Database Engineer & Integration Architect  
**Database Engine**: MySQL 8.0+  
**Database Name**: `skill_gap_analyzer`  
**Character Set**: `utf8mb4`  
**Storage Engine**: `InnoDB`  

---

## 1. Repository-to-Table Mapping

Every table in the database maps directly to a pure Java repository:

| Java Repository | Database Table | Primary Key | Foreign Keys | Columns Used by Queries |
|---|---|---|---|---|
| `StudentRepository` | `students` | `student_id` (AUTO_INCREMENT) | None | `student_id`, `name`, `email`, `password_hash`, `role`, `created_at` |
| `SkillRepository` | `skills` | `skill_id` (AUTO_INCREMENT) | None | `skill_id`, `name`, `category` |
| `StudentSkillRepository`| `student_skills`| `(student_id, skill_id)` | `student_id -> students.student_id`<br>`skill_id -> skills.skill_id` | `student_id`, `skill_id`, `proficiency` |
| `JobRepository` | `jobs` | `job_id` (AUTO_INCREMENT) | None | `job_id`, `title`, `company`, `location`, `created_at` |
| `JobSkillRepository` | `job_skills` | `(job_id, skill_id)` | `job_id -> jobs.job_id`<br>`skill_id -> skills.skill_id` | `job_id`, `skill_id`, `required_level`, `mandatory` |
| `ApplicationRepository`| `applications` | `application_id` (AUTO_INCREMENT)| `student_id -> students.student_id`<br>`job_id -> jobs.job_id` | `application_id`, `student_id`, `job_id`, `match_percent`, `status`, `created_at` |
| `RecommendationRepository`| `recommendations`| `id` (AUTO_INCREMENT) | `student_id -> students.student_id`<br>`job_id -> jobs.job_id`<br>`skill_id -> skills.skill_id` | `id`, `student_id`, `job_id`, `skill_id`, `priority`, `reason` |

---

## 2. Table Schemas & Constraints Detail

### 1. `students`
```sql
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- **Constraints**:
  - `email` must be UNIQUE.
  - `role` must be `'ADMIN'` or `'USER'`.

### 2. `skills`
```sql
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL
);
```
- **Constraints**:
  - `name` must be UNIQUE.

### 3. `student_skills`
```sql
CREATE TABLE student_skills (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency INT NOT NULL CHECK (proficiency BETWEEN 1 AND 5),
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_student_skills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);
```
- **Constraints**:
  - Composite Primary Key `(student_id, skill_id)` ensures a student has at most one evaluation per skill.
  - Check constraint: `proficiency BETWEEN 1 AND 5`. Missing skill is indicated by absence of a row, NEVER `proficiency = 0`.

### 4. `jobs`
```sql
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `job_skills`
```sql
CREATE TABLE job_skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    required_level INT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id),
    CONSTRAINT fk_job_skills_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);
```
- **Constraints**:
  - Composite Primary Key `(job_id, skill_id)`.
  - Check constraint: `required_level BETWEEN 1 AND 5`.
  - `mandatory`: boolean flag (TRUE for mandatory requirement, FALSE for optional).

### 6. `applications`
```sql
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    match_percent INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_job UNIQUE (student_id, job_id),
    CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);
```
- **Constraints**:
  - `uk_student_job UNIQUE (student_id, job_id)` prevents a student from applying to the same job multiple times.
  - Allowed `status` values: `'APPLIED'`, `'UNDER_REVIEW'`, `'SHORTLISTED'`, `'REJECTED'`, `'SELECTED'`.

### 7. `recommendations`
```sql
CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    CONSTRAINT fk_recommendations_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_recommendations_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_recommendations_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);
```

---

## 3. Critical Database Developer Assumptions & Rules

1. **Do not rename the 7 tables**:
   The backend repository queries explicitly query: `students`, `skills`, `student_skills`, `jobs`, `job_skills`, `applications`, `recommendations`.
2. **Preserve snake_case columns**:
   The backend repository layer specifically translates `snake_case` database column names to `camelCase` DTO fields:
   - `student_id` $\rightarrow$ `studentId`
   - `required_level` $\rightarrow$ `requiredLevel`
   - `match_percent` $\rightarrow$ `matchPercent`
3. **Foreign Key Deletions**:
   Use `ON DELETE CASCADE` on all foreign key constraints so cascading deletes (e.g. deleting a job cleans up `job_skills`, `applications`, and `recommendations`) do not throw foreign key constraint violations.
4. **Seed Data Must Retain Key IDs for Demo**:
   - Admin user: `student_id = 1`
   - Student Arun: `student_id = 101`
   - Job: `job_id = 501`
   - Skills: Java (`10`), MySQL (`11`), Spring Boot (`12`), Python (`13`), AWS (`14`), React (`15`).
