# Hackathon Judge Live Demonstration Script

**Project**: Employee / Student Skill Gap Analyzer  
**Presentation Theme**: High-Performance, Explainable Pure Java Backend with Deterministic Skill-Gap Intelligence and Role-Based Workflow

---

## ðŸŽ¯ Key Architectural Talking Points for Judges

1. **No Spring Boot / No Framework Magic**: The backend is built entirely with Pure Java standard library (`com.sun.net.httpserver.HttpServer`) and JDBC. It runs in milliseconds with negligible memory overhead and zero hidden framework abstractions.
2. **Authoritative Calculation Engine**: The backend owns the business logic. Neither the database nor the frontend calculates the match percentage.
3. **Missing Skill Zero Rule**: Absence of a skill in a student's profile is mathematically evaluated as Level 0 without polluting the database with invalid zero-proficiency rows.
4. **Weighted Scoring**: Mandatory skills carry double the importance (2.0x weight) of optional skills (1.0x weight).
5. **Deterministic Recommendations**: Every recommendation is justified with an explicit reason and prioritized (`HIGH`, `MEDIUM`, `LOW`).

---

## ðŸŽ¬ Live Demonstration Flow

### Phase 1: Administrator Oversight Flow

1. **Admin Login**:
   - Open browser at `http://localhost:5173`.
   - Log in with `admin@example.com` / `password`.
   - **Backend Action**: Validates credentials via salted PBKDF2 hash and issues Admin Bearer token.
2. **Platform Analytics Dashboard**:
   - Show high-level metrics: Total Students, Total Jobs, Total Applications, and Average Skill Match.
   - Show top system-wide skill gaps (e.g. Spring Boot, React).
3. **Job Catalog & Requirements**:
   - Navigate to Jobs $\rightarrow$ Select **