# Skill Gap Analyzer - Database Integration Guide

This document details the database architecture, JDBC connectivity, table mappings, transaction rules, and schema decisions for the backend.

---

## 1. JDBC Configuration

- **Database Engine**: MySQL 8.0+
- **Driver Class**: `com.mysql.cj.jdbc.Driver`
- **Driver Library**: `lib/mysql-connector-j.jar` (MySQL Connector/J 9.2.0)
- **Standard JDBC Connection URL**:
  ```
  jdbc:mysql://localhost:3306/skill_gap_analyzer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
  ```

### Required Environment Variables

| Variable | Description | Example / Default |
|---|---|---|
| `DB_URL` | Full JDBC connection URL | `jdbc:mysql://localhost:3306/skill_gap_analyzer...` |
| `DB_USER` | MySQL user account | `root` |
| `DB_PASSWORD` | MySQL account password | (set in `.env`) |
| `SERVER_PORT` | Port for Pure Java HTTP server | `8080` |
| `FRONTEND_ORIGIN` | Allowed CORS origin for React app | `http://localhost:5173` |

---

## 2. Table Specifications & Repository Mapping

The backend strictly preserves the **7 agreed domain tables**. No arbitrary tables have been introduced.

| # | Database Table | Java Model | Repository Class | Description |
|---|---|---|---|---|
| 1 | `students` | `Student` | `StudentRepository` | Stores user accounts (Students & Admins) with PBKDF2 hashed credentials |
| 2 | `skills` | `Skill` | `SkillRepository` | Catalog of skills and categories |
| 3 | `student_skills` | `StudentSkill` | `StudentSkillRepository` | Evaluated proficiencies (1â€“5) per student |
| 4 | `jobs` | `Job` | `JobRepository` | Job openings and metadata |
| 5 | `job_skills` | `JobSkill` | `JobSkillRepository` | Required skill proficiencies (1â€“5) and mandatory flags |
| 6 | `applications` | `Application` | `ApplicationRepository` | Submitted student job applications with authoritative match score |
| 7 | `recommendations` | `Recommendation` | `RecommendationRepository` | Persisted, prioritized gap recommendations |

---

## 3. Authentication Persistence Model

To support both **ADMIN** and **USER** roles securely while adhering to the constraint:
> *