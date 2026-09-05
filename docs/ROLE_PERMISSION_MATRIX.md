# Role and Permission Matrix

**System Roles**:
- `ADMIN`: Administrator with full platform oversight and management capabilities.
- `USER`: Student or Employee accessing personal profile, skill gap evaluations, and applications.

---

## Detailed Permission Matrix

| Feature / Resource Area | Endpoint | `ADMIN` Role | `USER` Role | Enforcement Mechanism |
|---|---|---|---|---|
| **Health Check** | `GET /api/health` | âœ… Allowed | âœ… Allowed | Public route |
| **Admin Login** | `POST /api/auth/admin/login` | âœ… Allowed | âŒ Rejected (403) | `AuthService.loginAdmin()` validates `role == 'ADMIN'` |
| **User Login** | `POST /api/auth/user/login` | âœ… Allowed | âœ… Allowed | `AuthService.loginUser()` |
| **View Own Identity** | `GET /api/auth/me` | âœ… Allowed | âœ… Allowed | Requires valid Bearer token |
| **Logout** | `POST /api/auth/logout` | âœ… Allowed | âœ… Allowed | Revokes current token in `TokenService` |
| **View Students List** | `GET /api/students` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Create Student Account** | `POST /api/students` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **View Student Profile** | `GET /api/students/{id}` | âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(id)` |
| **Update Student Profile** | `PUT /api/students/{id}` | âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(id)` |
| **View Student Skills** | `GET /api/students/{id}/skills` | âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(id)` |
| **Add/Update Student Skill** | `POST /api/students/{id}/skills`| âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(id)` |
| **Delete Student Skill** | `DELETE /api/students/{id}/skills/{skillId}` | âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(id)` |
| **View Skills Catalog** | `GET /api/skills`, `GET /api/skills/{id}` | âœ… Allowed | âœ… Allowed | Open catalog access |
| **Create Catalog Skill** | `POST /api/skills` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Update Catalog Skill** | `PUT /api/skills/{id}` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Delete Catalog Skill** | `DELETE /api/skills/{id}` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **View Jobs Listing** | `GET /api/jobs`, `GET /api/jobs/{id}` | âœ… Allowed | âœ… Allowed | Open job browsing |
| **Create Job Posting** | `POST /api/jobs` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Update Job Posting** | `PUT /api/jobs/{id}` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Delete Job Posting** | `DELETE /api/jobs/{id}` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **View Job Requirements** | `GET /api/jobs/{id}/skills` | âœ… Allowed | âœ… Allowed | Open requirement viewing |
| **Add/Update Job Requirement** | `POST /api/jobs/{id}/skills` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Delete Job Requirement** | `DELETE /api/jobs/{id}/skills/{skillId}` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **Analyze Skill Gap** | `GET /api/students/{studentId}/jobs/{jobId}/skill-gap` | âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(studentId)` |
| **View Recommendations** | `GET /api/students/{studentId}/jobs/{jobId}/recommendations` | âœ… Allowed (any student) | âš ï¸ Own Only (403 if other) | `SecurityContext.requireAdminOrOwner(studentId)` |
| **Submit Job Application** | `POST /api/applications` | âœ… Allowed (specifies studentId)| âœ… Allowed (bound to own ID)| USER cannot forge studentId; backend enforces session ID |
| **View Applications** | `GET /api/applications` | âœ… Returns all platform apps | âš ï¸ Returns own applications only | Filtered by `currentUser.getUserId()` in `ApplicationService` |
| **View Single Application** | `GET /api/applications/{id}` | âœ… Allowed | âš ï¸ Own Only (403 if other) | `ApplicationService.getApplicationById()` |
| **Update Application Status** | `PUT /api/applications/{id}/status` | âœ… Allowed | âŒ Forbidden (403) | `SecurityContext.requireAdmin()` |
| **View Dashboard Summary** | `GET /api/dashboard/summary` | âœ… Platform metrics | âš ï¸ User-scoped metrics | `DashboardService.getSummary()` adjusts based on role |

---

## Key Security Guarantee
No administrative capability can be executed by a standard `USER` merely by manually crafting or calling the REST endpoint. All authorization checks occur on the server within `SecurityContext` and the business service layer.
