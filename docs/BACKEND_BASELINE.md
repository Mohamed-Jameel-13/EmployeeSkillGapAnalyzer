# Backend Integration Baseline Report

**Project**: Employee / Student Skill Gap Analyzer  
**Component**: Pure Java REST API Backend  
**Document Status**: LOCKED BASELINE BEFORE INTEGRATION  
**Date**: 2026-09-05  

---

## 1. Runtime & Environment Baseline

- **Java Version**: OpenJDK / Oracle JDK 25 LTS (`javac 25.0.3` / `java 25.0.3 2026-04-21 LTS`)
- **JVM**: Java HotSpot(TM) 64-Bit Server VM (build 25.0.3+9-LTS-195)
- **Database Engine**: MySQL 8.0+ running on `localhost:3306`
- **Database Name**: `skill_gap_analyzer`
- **JDBC Driver**: `com.mysql.cj.jdbc.Driver` located at `lib/mysql-connector-j.jar` (MySQL Connector/J 9.2.0)
- **External Dependencies**: Zero runtime framework dependencies (No Spring Boot, No Hibernate, No Jakarta EE, No external HTTP/JSON frameworks)

---

## 2. Architecture & Package Structure

The backend adheres strictly to a clean layered architecture with explicit separation of concerns:

```
com.skillgap
â”œâ”€â”€ config/        # Environment and JDBC connection lifecycle
â”‚   â”œâ”€â”€ AppConfig.java
â”‚   â”œâ”€â”€ DatabaseConfig.java
â”‚   â””â”€â”€ EnvLoader.java
â”œâ”€â”€ server/        # Standard library HTTP server wrapper & CORS
â”‚   â””â”€â”€ HttpServerApp.java
â”œâ”€â”€ router/        # Regex route pattern matching, path params, method dispatch
â”‚   â”œâ”€â”€ HttpResponse.java
â”‚   â”œâ”€â”€ RequestContext.java
â”‚   â”œâ”€â”€ RouteHandler.java
â”‚   â””â”€â”€ Router.java
â”œâ”€â”€ controller/    # HTTP boundary validation & service delegation
â”‚   â”œâ”€â”€ ApplicationController.java
â”‚   â”œâ”€â”€ AuthController.java
â”‚   â”œâ”€â”€ DashboardController.java
â”‚   â”œâ”€â”€ HealthController.java
â”‚   â”œâ”€â”€ JobController.java
â”‚   â”œâ”€â”€ JobSkillController.java
â”‚   â”œâ”€â”€ RecommendationController.java
â”‚   â”œâ”€â”€ SkillController.java
â”‚   â”œâ”€â”€ SkillGapController.java
â”‚   â”œâ”€â”€ StudentController.java
â”‚   â””â”€â”€ StudentSkillController.java
â”œâ”€â”€ service/       # Authoritative business logic & deterministic calculation engines
â”‚   â”œâ”€â”€ ApplicationService.java
â”‚   â”œâ”€â”€ AuthService.java
â”‚   â”œâ”€â”€ DashboardService.java
â”‚   â”œâ”€â”€ JobService.java
â”‚   â”œâ”€â”€ RecommendationService.java
â”‚   â”œâ”€â”€ SkillGapService.java
â”‚   â”œâ”€â”€ SkillService.java
â”‚   â””â”€â”€ StudentService.java
â”œâ”€â”€ repository/    # Pure JDBC with PreparedStatement & transaction boundaries
â”‚   â”œâ”€â”€ ApplicationRepository.java
â”‚   â”œâ”€â”€ JobRepository.java
â”‚   â”œâ”€â”€ JobSkillRepository.java
â”‚   â”œâ”€â”€ RecommendationRepository.java
â”‚   â”œâ”€â”€ SkillRepository.java
â”‚   â”œâ”€â”€ StudentRepository.java
â”‚   â””â”€â”€ StudentSkillRepository.java
â”œâ”€â”€ model/         # Domain entities mapping to MySQL schema
â”‚   â”œâ”€â”€ Application.java
â”‚   â”œâ”€â”€ Job.java
â”‚   â”œâ”€â”€ JobSkill.java
â”‚   â”œâ”€â”€ Recommendation.java
â”‚   â”œâ”€â”€ Skill.java
â”‚   â”œâ”€â”€ Student.java
â”‚   â””â”€â”€ StudentSkill.java
â”œâ”€â”€ dto/           # camelCase request/response transfer objects matching frontend contract
â”‚   â”œâ”€â”€ ApplicationRequest.java
â”‚   â”œâ”€â”€ ApplicationResponse.java
â”‚   â”œâ”€â”€ AuthResponse.java
â”‚   â”œâ”€â”€ CreateJobRequest.java
â”‚   â”œâ”€â”€ CreateSkillRequest.java
â”‚   â”œâ”€â”€ CreateStudentRequest.java
â”‚   â”œâ”€â”€ DashboardSummaryDto.java
â”‚   â”œâ”€â”€ ErrorResponse.java
â”‚   â”œâ”€â”€ JobDto.java
â”‚   â”œâ”€â”€ JobSkillDto.java
â”‚   â”œâ”€â”€ JobSkillRequest.java
â”‚   â”œâ”€â”€ LoginRequest.java
â”‚   â”œâ”€â”€ RecommendationDto.java
â”‚   â”œâ”€â”€ SkillAnalysisDto.java
â”‚   â”œâ”€â”€ SkillDto.java
â”‚   â”œâ”€â”€ SkillGapResponse.java
â”‚   â”œâ”€â”€ StudentSkillRequest.java
â”‚   â”œâ”€â”€ TopSkillGapDto.java
â”‚   â”œâ”€â”€ UpdateJobRequest.java
â”‚   â”œâ”€â”€ UpdateStatusRequest.java
â”‚   â”œâ”€â”€ UpdateStudentRequest.java
â”‚   â””â”€â”€ UserDto.java
â”œâ”€â”€ security/      # Cryptographic hashing, token sessions, security context
â”‚   â”œâ”€â”€ PasswordUtil.java
â”‚   â”œâ”€â”€ Role.java
â”‚   â”œâ”€â”€ SecurityContext.java
â”‚   â”œâ”€â”€ TokenService.java
â”‚   â””â”€â”€ UserPrincipal.java
â”œâ”€â”€ exception/     # Standardized exception hierarchy (400, 401, 403, 404, 409, 500)
â”‚   â”œâ”€â”€ ApiException.java
â”‚   â”œâ”€â”€ BadRequestException.java
â”‚   â”œâ”€â”€ ConflictException.java
â”‚   â”œâ”€â”€ DatabaseException.java
â”‚   â”œâ”€â”€ ForbiddenException.java
â”‚   â”œâ”€â”€ NotFoundException.java
â”‚   â”œâ”€â”€ UnauthorizedException.java
â”‚   â””â”€â”€ ValidationException.java
â”œâ”€â”€ util/          # Pure Java JSON serializer/parser, response utilities
â”‚   â”œâ”€â”€ HttpResponseUtil.java
â”‚   â””â”€â”€ JsonUtil.java
â””â”€â”€ Main.java      # Application bootstrap entry point
```

---

## 3. Server Implementation & CORS

- **HTTP Server**: `com.sun.net.httpserver.HttpServer`
- **Port**: Configurable via `SERVER_PORT` (default `8080`)
- **Threading**: Multi-threaded request execution using `Executors.newFixedThreadPool(20)`
- **CORS Handling**:
  - Automatically handles preflight `OPTIONS` requests across all routes returning `204 No Content`.
  - Sets headers:
    - `Access-Control-Allow-Origin: <FRONTEND_ORIGIN>` (default `http://localhost:5173`)
    - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
    - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept`
    - `Access-Control-Allow-Credentials: true`
    - `Access-Control-Max-Age: 3600`

---

## 4. Authentication & Role-Based Authorization

### 4.1 Password Security
- **Algorithm**: `PBKDF2WithHmacSHA256`
- **Iterations**: 65,536
- **Salt**: 16 cryptographically random bytes generated via `SecureRandom`
- **Storage Format**: `saltHex:hashHex`
- **Verification**: Constant-time byte comparison preventing timing attacks.
- **Rule**: Plaintext passwords and hashes are never returned via any API and are never written to logs.

### 4.2 Session Token Management
- **Token Generation**: Secure random 32-byte hex token prefixed with `sga_` (e.g. `sga_a1b2c3...`).
- **Token Transmission**: `Authorization: Bearer <token>`
- **Token Lifecycle**: In-memory registry with 24-hour expiration, active session lookup, and explicit revocation via `/api/auth/logout`.

### 4.3 Permissions Matrix
- **ADMIN**:
  - View, create, update students (`/api/students`)
  - Manage skills catalog (`POST`, `PUT`, `DELETE /api/skills`)
  - Manage job postings (`POST`, `PUT`, `DELETE /api/jobs`)
  - Manage job skill requirements (`POST`, `DELETE /api/jobs/{id}/skills`)
  - View all student profiles, skills, gap analyses, and recommendations
  - View all applications across platform (`GET /api/applications`)
  - Update application review status (`PUT /api/applications/{id}/status`)
  - View platform-wide dashboard summary
- **USER**:
  - View/update own profile only (`/api/students/{ownId}`)
  - View/add/update/delete own evaluated skills only (`/api/students/{ownId}/skills`)
  - Browse available jobs and job requirements (`/api/jobs`, `/api/jobs/{id}/skills`)
  - Run skill gap analysis for self (`/api/students/{ownId}/jobs/{jobId}/skill-gap`)
  - View own recommendations (`/api/students/{ownId}/jobs/{jobId}/recommendations`)
  - Apply for jobs (authenticated studentId strictly enforced; cannot submit as another user)
  - View own applications only (`GET /api/applications`)
  - Cannot access administrative endpoints (`403 Forbidden`)
  - Cannot update application statuses (`403 Forbidden`)

---

## 5. REST Endpoints Baseline

| Method | Path | Auth Required | Role Enforced | Success Code |
|---|---|---|---|---|
| `GET` | `/api/health` | No | Any | 200 |
| `POST` | `/api/auth/admin/login` | No | ADMIN | 200 |
| `POST` | `/api/auth/user/login` | No | USER / ADMIN | 200 |
| `POST` | `/api/auth/logout` | Yes | Authenticated | 200 |
| `GET` | `/api/auth/me` | Yes | Authenticated | 200 |
| `GET` | `/api/students` | Yes | ADMIN | 200 |
| `POST` | `/api/students` | Yes | ADMIN | 201 |
| `GET` | `/api/students/{id}` | Yes | ADMIN or Owner | 200 |
| `PUT` | `/api/students/{id}` | Yes | ADMIN or Owner | 200 |
| `GET` | `/api/students/{id}/skills` | Yes | ADMIN or Owner | 200 |
| `POST` | `/api/students/{id}/skills` | Yes | ADMIN or Owner | 200 |
| `DELETE` | `/api/students/{id}/skills/{skillId}` | Yes | ADMIN or Owner | 200 |
| `GET` | `/api/skills` | No | Any | 200 |
| `GET` | `/api/skills/{id}` | No | Any | 200 |
| `POST` | `/api/skills` | Yes | ADMIN | 201 |
| `PUT` | `/api/skills/{id}` | Yes | ADMIN | 200 |
| `DELETE` | `/api/skills/{id}` | Yes | ADMIN | 200 |
| `GET` | `/api/jobs` | No | Any | 200 |
| `GET` | `/api/jobs/{id}` | No | Any | 200 |
| `POST` | `/api/jobs` | Yes | ADMIN | 201 |
| `PUT` | `/api/jobs/{id}` | Yes | ADMIN | 200 |
| `DELETE` | `/api/jobs/{id}` | Yes | ADMIN | 200 |
| `GET` | `/api/jobs/{id}/skills` | No | Any | 200 |
| `POST` | `/api/jobs/{id}/skills` | Yes | ADMIN | 200 |
| `DELETE` | `/api/jobs/{id}/skills/{skillId}` | Yes | ADMIN | 200 |
| `GET` | `/api/students/{studentId}/jobs/{jobId}/skill-gap` | Yes | ADMIN or Owner | 200 |
| `GET` | `/api/students/{studentId}/jobs/{jobId}/recommendations` | Yes | ADMIN or Owner | 200 |
| `POST` | `/api/applications` | Yes | Authenticated | 201 |
| `GET` | `/api/applications` | Yes | Authenticated | 200 |
| `GET` | `/api/applications/{id}` | Yes | ADMIN or Owner | 200 |
| `PUT` | `/api/applications/{id}/status` | Yes | ADMIN | 200 |
| `GET` | `/api/dashboard/summary` | Yes | Authenticated | 200 |

---

## 6. Business Engine Formulas & Baseline Values

### 6.1 Skill Gap Analysis
- **Missing Skill Rule**: Absence of a row in `student_skills` for a required job skill $\rightarrow \text{currentLevel} = 0$.
- **Gap**: $\max(\text{requiredLevel} - \text{currentLevel}, 0)$
- **Status**: `