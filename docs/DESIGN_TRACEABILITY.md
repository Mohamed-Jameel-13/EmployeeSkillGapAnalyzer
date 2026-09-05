# Design-to-System Traceability Matrix

This document maps all product features and reference design requirements directly to the backend implementation, database tables, and REST endpoints.

---

## 1. User Journey Traceability

```
User (Student/Employee)
 â”‚
 â”œâ”€â”€ 1. Login / Authentication
 â”‚       â”œâ”€â”€ Endpoint: POST /api/auth/user/login
 â”‚       â””â”€â”€ Service: AuthService.loginUser()
 â”‚
 â”œâ”€â”€ 2. View Profile & Skills
 â”‚       â”œâ”€â”€ Endpoint: GET /api/students/{id}
 â”‚       â”œâ”€â”€ Endpoint: GET /api/students/{id}/skills
 â”‚       â””â”€â”€ Table: students, student_skills
 â”‚
 â”œâ”€â”€ 3. Browse Jobs & Requirements
 â”‚       â”œâ”€â”€ Endpoint: GET /api/jobs
 â”‚       â”œâ”€â”€ Endpoint: GET /api/jobs/{id}
 â”‚       â”œâ”€â”€ Endpoint: GET /api/jobs/{id}/skills
 â”‚       â””â”€â”€ Table: jobs, job_skills
 â”‚
 â”œâ”€â”€ 4. Run Skill Gap Analysis
 â”‚       â”œâ”€â”€ Endpoint: GET /api/students/{studentId}/jobs/{jobId}/skill-gap
 â”‚       â”œâ”€â”€ Service: SkillGapService.analyzeSkillGap()
 â”‚       â””â”€â”€ Output: Overall match %, per-skill gap, status (MATCHED / GAP)
 â”‚
 â”œâ”€â”€ 5. Review Prioritized Recommendations
 â”‚       â”œâ”€â”€ Endpoint: GET /api/students/{studentId}/jobs/{jobId}/recommendations
 â”‚       â”œâ”€â”€ Service: RecommendationService.getRecommendations()
 â”‚       â””â”€â”€ Table: recommendations (atomically refreshed)
 â”‚
 â”œâ”€â”€ 6. Apply for Job
 â”‚       â”œâ”€â”€ Endpoint: POST /api/applications
 â”‚       â”œâ”€â”€ Service: ApplicationService.apply()
 â”‚       â””â”€â”€ Table: applications (status = 'APPLIED', match_percent stored)
 â”‚
 â””â”€â”€ 7. Track Submitted Applications
         â”œâ”€â”€ Endpoint: GET /api/applications
         â””â”€â”€ Scope: Authenticated student sees only their own applications
```

---

## 2. Admin Journey Traceability

```
Administrator
 â”‚
 â”œâ”€â”€ 1. Admin Authentication
 â”‚       â”œâ”€â”€ Endpoint: POST /api/auth/admin/login
 â”‚       â””â”€â”€ Role Check: Student.role == 'ADMIN'
 â”‚
 â”œâ”€â”€ 2. Platform Analytics Dashboard
 â”‚       â”œâ”€â”€ Endpoint: GET /api/dashboard/summary
 â”‚       â””â”€â”€ Metrics: totalStudents, totalJobs, totalApplications, avgMatch, topGaps
 â”‚
 â”œâ”€â”€ 3. Manage Students Catalog
 â”‚       â”œâ”€â”€ Endpoint: GET /api/students
 â”‚       â”œâ”€â”€ Endpoint: POST /api/students
 â”‚       â””â”€â”€ Endpoint: PUT /api/students/{id}
 â”‚
 â”œâ”€â”€ 4. Manage Skills Catalog
 â”‚       â”œâ”€â”€ Endpoint: GET /api/skills
 â”‚       â”œâ”€â”€ Endpoint: POST /api/skills
 â”‚       â”œâ”€â”€ Endpoint: PUT /api/skills/{id}
 â”‚       â””â”€â”€ Endpoint: DELETE /api/skills/{id}
 â”‚
 â”œâ”€â”€ 5. Manage Jobs & Job Requirements
 â”‚       â”œâ”€â”€ Endpoint: POST /api/jobs
 â”‚       â”œâ”€â”€ Endpoint: PUT /api/jobs/{id}
 â”‚       â”œâ”€â”€ Endpoint: DELETE /api/jobs/{id}
 â”‚       â”œâ”€â”€ Endpoint: POST /api/jobs/{id}/skills
 â”‚       â””â”€â”€ Endpoint: DELETE /api/jobs/{id}/skills/{skillId}
 â”‚
 â”œâ”€â”€ 6. Analyze Any Candidate Against Any Job
 â”‚       â””â”€â”€ Endpoint: GET /api/students/{studentId}/jobs/{jobId}/skill-gap
 â”‚
 â””â”€â”€ 7. Review Platform Applications & Update Review Status
         â”œâ”€â”€ Endpoint: GET /api/applications (all platform applications)
         â”œâ”€â”€ Endpoint: GET /api/applications/{id}
         â””â”€â”€ Endpoint: PUT /api/applications/{id}/status (APPLIED -> SHORTLISTED, etc.)
```

---

## 3. Requirement-to-Code Mapping

| Requirement Name | Reference Design Spec | Implementation Class | Database Table | Status |
|---|---|---|---|---|
| **Health Check** | Platform liveness verification | `HealthController` | N/A | Fully Implemented & Tested |
| **User Login** | Separate user authentication flow | `AuthController`, `AuthService`, `PasswordUtil` | `students` | Fully Implemented & Tested |
| **Admin Login** | Separate admin authentication flow | `AuthController`, `AuthService`, `PasswordUtil` | `students` | Fully Implemented & Tested |
| **Session Handling** | Bearer token authentication | `TokenService`, `SecurityContext` | In-memory registry | Fully Implemented & Tested |
| **Student Management** | Admin manages registered students | `StudentController`, `StudentService` | `students` | Fully Implemented & Tested |
| **Student Skills** | Students evaluate proficiencies (1â€“5) | `StudentSkillController`, `StudentSkillRepository` | `student_skills` | Fully Implemented & Tested |
| **Skills Catalog** | Central catalog of skills and categories | `SkillController`, `SkillService`, `SkillRepository` | `skills` | Fully Implemented & Tested |
| **Job Management** | Job postings with title, company, location | `JobController`, `JobService`, `JobRepository` | `jobs` | Fully Implemented & Tested |
| **Job Requirements** | Skill levels & mandatory flags per job | `JobSkillController`, `JobSkillRepository` | `job_skills` | Fully Implemented & Tested |
| **Skill Gap Engine** | Authoritative calculation of gaps & score | `SkillGapService`, `SkillGapController` | `students`, `jobs`, `student_skills`, `job_skills` | Fully Implemented & Tested |
| **Missing Skill Rule** | Absence of skill evaluated as level 0 | `SkillGapService` | N/A (no dummy DB rows) | Fully Implemented & Tested |
| **Weighted Match %** | Mandatory skills have 2.0x weight | `SkillGapService` | N/A (authoritative Java math) | Fully Implemented & Tested |
| **Recommendation Engine** | Deterministic prioritization (HIGH, MED, LOW) | `RecommendationService`, `RecommendationRepository` | `recommendations` | Fully Implemented & Tested |
| **Application Submission** | Students apply for jobs | `ApplicationService`, `ApplicationController` | `applications` | Fully Implemented & Tested |
| **Duplicate Application Protection** | Block multiple applications to same job | `ApplicationService`, `ApplicationRepository` | `applications` (`uk_student_job`) | Fully Implemented & Tested |
| **Status Updates** | Admin updates review status | `ApplicationService` | `applications` | Fully Implemented & Tested |
| **Dashboard Analytics** | Aggregated platform and user metrics | `DashboardService`, `DashboardController` | `students`, `jobs`, `applications`, `recommendations` | Fully Implemented & Tested |
