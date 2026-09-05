# Integration Risk Register & Resolution Status

**Status**: ALL RISKS VERIFIED & MITIGATED  
**Classification**:
- 🟢 **RESOLVED**: Verified and working as intended in integrated environment
- 🟡 **MONITORED**: Working with clear configuration policy

---

## Risk Summary Matrix

| ID | Integration Area | Risk Description | Status | Resolution & Implemented Policy |
|---|---|---|---|---|
| **RSK-001** | **Casing Translation** | Database uses `snake_case` (`student_id`, `match_percent`), REST API uses `camelCase` (`studentId`, `matchPercent`). | 🟢 RESOLVED | Fully handled in repository layer. Repositories explicitly map SQL column names to Java models and camelCase DTOs. |
| **RSK-002** | **Match Score Value Discrepancy** | Reference mockups mention arbitrary values; backend authoritative deterministic formula calculates exact weighted score. | 🟢 RESOLVED | The backend formula is authoritative ($\min(c/r, 1.0) \times w$ with mandatory weight 2.0, optional 1.0). The frontend strictly consumes and renders the backend calculation. |
| **RSK-003** | **Missing Skill Level 0** | Database Check constraint strictly enforces `proficiency BETWEEN 1 AND 5`. | 🟢 RESOLVED | The database Check constraint strictly enforces `proficiency BETWEEN 1 AND 5`. Backend handles missing skills by returning `currentLevel: 0` in `/api/students/{id}/jobs/{jobId}/skill-gap`. Frontend renders 0 cleanly. |
| **RSK-004** | **CORS & Dev Ports** | React dev server port might vary (3000 vs 5173). | 🟢 RESOLVED | Frontend is standardized on port 3000. Backend `FRONTEND_ORIGIN` is configured to `http://localhost:3000`. CORS preflight (OPTIONS) verified passing. |
| **RSK-005** | **Auth Header Format** | Frontend might send token via custom header instead of Bearer token. | 🟢 RESOLVED | Frontend API client in `src/api/client.js` attaches `Authorization: Bearer <token>` to all authenticated HTTP requests. |
| **RSK-006** | **HTTP Method Alignment** | Student skills add/update endpoint uses `POST /api/students/{id}/skills`. | 🟢 RESOLVED | Frontend conforms to `POST /api/students/{id}/skills` for skill upsert. |
| **RSK-007** | **Application Student ID Trust** | Malicious client might attempt to apply on behalf of another candidate. | 🟢 RESOLVED | Backend security rule enforces that `USER` role tokens can only apply for their own verified `userId`. |
| **RSK-008** | **Application Status Updates** | Frontend might expose application status transitions to non-admin students. | 🟢 RESOLVED | Server-side authorization blocks non-admins from `PUT /api/applications/{id}/status` with `403 Forbidden`. Admin role can update cleanly. |
| **RSK-009** | **Recommendation Persistence** | Recommendations could become stale if student updates their skills. | 🟢 RESOLVED | Whenever `/api/students/{studentId}/jobs/{jobId}/recommendations` is requested, backend recalculates fresh gaps and atomically replaces old recommendations via single JDBC transaction. |
| **RSK-010** | **Database Schema Consistency** | Schema alignment between Java entities and MySQL tables. | 🟢 RESOLVED | The 7 tables in `backend/sql/schema.sql` are locked and verified against repository mappings. |
| **RSK-011** | **Duplicate Applications** | User double-clicking or re-applying to the same job. | 🟢 RESOLVED | Unique constraint and service logic block duplicates with `409 Conflict`. |