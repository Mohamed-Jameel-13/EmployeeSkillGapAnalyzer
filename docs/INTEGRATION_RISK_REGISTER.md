# Integration Risk Register

**Status**: ACTIVE RISK TRACKER  
**Classification**:
- ðŸŸ¢ **GREEN**: No known issue (clean alignment established)
- ðŸŸ¡ **YELLOW**: Verification required during incoming integration
- ðŸ”´ **RED**: Known mismatch requiring explicit resolution during integration

---

## Risk Summary Matrix

| ID | Integration Area | Risk Description | Severity | Mitigation & Policy |
|---|---|---|---|---|
| **RSK-001** | **Casing Translation** | Database uses `snake_case` (`student_id`, `match_percent`), REST API uses `camelCase` (`studentId`, `matchPercent`). | ðŸŸ¢ GREEN | Fully handled in repository layer. Repositories explicitly map SQL column names to Java models and camelCase DTOs. |
| **RSK-002** | **Match Score Value Discrepancy** | Reference paper/UI mockups mention 72% or 74% match; the backend's authoritative deterministic formula calculates 65% for Arun against Job 501. | ðŸŸ¡ YELLOW | The backend formula is deterministic ($\min(c/r, 1.0) \times w$ with mandatory weight 2.0, optional 1.0). The frontend must NOT compute or hardcode percentages. It must display whatever authoritative score the backend returns. Verify with judges/team during demo. |
| **RSK-003** | **Missing Skill Level 0** | Frontend might expect a row in `student_skills` with `proficiency = 0` for missing skills. | ðŸŸ¢ GREEN | The database Check constraint strictly enforces `proficiency BETWEEN 1 AND 5`. The backend handles missing skills in Java by returning `currentLevel: 0` in `/api/students/{id}/jobs/{jobId}/skill-gap`. Frontend must render level 0 gracefully. |
| **RSK-004** | **CORS & Dev Ports** | Lovable / React dev server port might vary (e.g. 5173, 3000, or 8081). | ðŸŸ¡ YELLOW | Backend port is 8080. `FRONTEND_ORIGIN` is configurable in `.env`. When frontend is placed in `frontend/`, verify which port Vite runs on and update `FRONTEND_ORIGIN` accordingly. |
| **RSK-005** | **Auth Header Format** | Incoming frontend might send token via custom header (`X-Auth-Token` or cookie) instead of `Authorization: Bearer <token>`. | ðŸŸ¡ YELLOW | Backend strictly requires `Authorization: Bearer <token>`. During frontend integration, ensure the frontend Axios/fetch interceptor attaches `Authorization: Bearer <token>`. |
| **RSK-006** | **HTTP Method Alignment** | Student skills add/update endpoint uses `POST /api/students/{id}/skills` per agreed contract. Some frontends default to `PUT` or `PATCH`. | ðŸŸ¡ YELLOW | Verify that frontend calls `POST /api/students/{id}/skills` for skill upsert. Do not change backend to PUT without formal agreement. |
| **RSK-007** | **Application Student ID Trust** | Frontend might send arbitrary `studentId` when a user applies for a job. | ðŸŸ¢ GREEN | Backend security rule strictly enforces the authenticated student's identity from the session token for `USER` role requests. |
| **RSK-008** | **Application Status Updates** | Frontend might expose application status dropdowns to non-admin students. | ðŸŸ¢ GREEN | Backend server-side authorization blocks non-admins from `PUT /api/applications/{id}/status` with `403 Forbidden`. Frontend should also conditionally hide status controls for USER role. |
| **RSK-009** | **Recommendation Persistence Lifecycle** | Recommendations could become stale if student updates their skills. | ðŸŸ¢ GREEN | Whenever `/api/students/{studentId}/jobs/{jobId}/recommendations` is requested, the backend recalculates fresh gaps and atomically replaces old recommendations via a single JDBC transaction. |
| **RSK-010** | **Database Schema Alterations from SQL Teammate** | Teammate's incoming `schema.sql` might use different table names (e.g. `tbl_students`, `users`) or drop foreign key constraints. | ðŸ”´ RED | The 7 agreed tables are locked. If the incoming SQL delivery alters table or column names, the SQL delivery must be reconciled against `docs/DATABASE_CONTRACT.md` before merging. |
| **RSK-011** | **Duplicate Applications** | User double-clicking 