# Employee / Student Skill Gap Analyzer - Pure Java Backend

A high-performance, robust, and explainable **Pure Java + JDBC + MySQL REST API Backend** built for the **Employee / Student Skill Gap Analyzer** hackathon project.

Designed to integrate seamlessly with the **React + Tailwind CSS + Lovable** frontend.

---

## 🚀 Key Highlights

- **Pure Java Standard Library**: Built using `com.sun.net.httpserver.HttpServer` and standard Java cryptography (`PBKDF2WithHmacSHA256`).
- **No Heavy Frameworks**: Zero Spring Boot, zero ORM, zero hidden magic. Highly explainable to hackathon judges.
- **Pure JDBC**: Safe parameterized queries (`PreparedStatement`) everywhere, connection management, and atomic transaction rollbacks.
- **Authoritative Calculations**: Backend owns the official deterministic skill-gap calculation and weighted match scoring (mandatory skills carry 2.0x weight).
- **Prioritized Recommendations**: Deterministic recommendation engine prioritizing gaps (`HIGH`, `MEDIUM`, `LOW`) with justifications.
- **Full Role-Based Security**: Server-side role enforcement for `ADMIN` and `USER` roles, Bearer token sessions, duplicate application protection, and cross-student data protection.
- **Strict Frontend Contract Alignment**: Strict camelCase JSON matching all React components.

---

## 📁 Architecture Overview

```
SkillGapAnalyzer/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/skillgap/
│   │           ├── config/        # EnvLoader, AppConfig, DatabaseConfig
│   │           ├── server/        # HttpServerApp, CORS preflight, lifecycle
│   │           ├── router/        # Path matching, path variables, dispatch
│   │           ├── controller/    # REST controllers for all domain entities
│   │           ├── service/       # Business logic (SkillGap, Recs, Apps, Auth)
│   │           ├── repository/    # Pure JDBC with PreparedStatement
│   │           ├── model/         # Domain entities
│   │           ├── dto/           # camelCase request/response transfer objects
│   │           ├── security/      # PBKDF2 PasswordUtil, TokenService, Context
│   │           ├── exception/     # Centralized exception hierarchy (400-500)
│   │           ├── util/          # Pure Java JsonUtil, HttpResponseUtil
│   │           └── Main.java      # Application entry point
│   └── test/
│       └── java/
│           └── com/skillgap/
│               ├── TestRunner.java          # Automated unit & domain tests
│               └── HttpIntegrationTest.java # End-to-end HTTP wire test suite
├── lib/
│   └── mysql-connector-j.jar      # MySQL Connector/J JDBC driver
├── sql/
│   ├── schema.sql                 # Complete MySQL schema DDL
│   └── seed.sql                   # Hackathon demo seed data
├── docs/
│   ├── API.md                     # Comprehensive REST API reference
│   └── DATABASE_INTEGRATION.md    # JDBC configuration & database integration
├── .env.example                   # Environment configuration template
├── README.md                      # Setup and run instructions
└── BACKEND_COMPLETION_REPORT.md   # Detailed completion report
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. Prerequisites
- **Java**: JDK 17, 21, or 25 (Java 25 LTS installed)
- **MySQL**: MySQL 8.0+ running on `localhost:3306`

### 2. Database Initialization
Open MySQL client or MySQL Workbench and run:
```bash
# Using mysql CLI:
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

This creates the `skill_gap_analyzer` database and populates the 7 tables with demo data:
- **Admin**: `admin@example.com` / `password`
- **Student Arun**: `arun@example.com` / `password`
- **Job 501**: `Java Full Stack Developer` at `ABC Technologies`

### 3. Environment Configuration
Copy `.env.example` to `.env` and set your MySQL password:
```properties
DB_URL=jdbc:mysql://localhost:3306/skill_gap_analyzer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USER=root
DB_PASSWORD=your_mysql_password
SERVER_PORT=8080
FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Compilation
Compile the backend using the included MySQL JDBC driver:

**PowerShell (Windows):**
```powershell
$files = (Get-ChildItem -Path "src\main\java" -Recurse -Filter "*.java").FullName
New-Item -ItemType Directory -Force target\classes
javac -cp "lib\mysql-connector-j.jar;src\main\java" -d target\classes $files
```

**Bash (Linux / macOS):**
```bash
mkdir -p target/classes
javac -cp "lib/mysql-connector-j.jar:src/main/java" -d target/classes $(find src/main/java -name "*.java")
```

### 5. Running the Backend Server
Start the HTTP REST server:

**Windows (PowerShell):**
```powershell
java -cp "lib\mysql-connector-j.jar;target\classes" com.skillgap.Main
```

**Linux / macOS:**
```bash
java -cp "lib/mysql-connector-j.jar:target/classes" com.skillgap.Main
```

You will see:
```text
=================================================
 Skill Gap Analyzer HTTP REST Server Started!
 Port: 8080
 Frontend Origin: http://localhost:5173
 Health: http://localhost:8080/api/health
=================================================
```

### 6. Verify Health Endpoint
```bash
curl http://localhost:8080/api/health
```
Response:
```json
{"status":"UP"}
```

---

## 🧪 Running Automated Tests

### 1. Unit & Domain Tests (`TestRunner.java`)
Tests calculations, PBKDF2 hashing, token sessions, recommendation priority rules, and duplicate checks:
```powershell
javac -cp "target\classes" -d target\test-classes src\test\java\com\skillgap\TestRunner.java
java -cp "target\classes;target\test-classes" com.skillgap.TestRunner
```
*Result: 39 / 39 PASSED.*

### 2. End-to-End HTTP Wire Integration Tests (`HttpIntegrationTest.java`)
Starts an embedded test server on an ephemeral port and sends real HTTP requests testing CORS, Auth, 401/403/404/409, Skill Gap, Recommendations, and Applications:
```powershell
javac -cp "target\classes" -d target\test-classes src\test\java\com\skillgap\HttpIntegrationTest.java
java -cp "target\classes;target\test-classes" com.skillgap.HttpIntegrationTest
```
*Result: 31 / 31 PASSED.*

---

## 🌐 Connecting with Frontend

In your React / Lovable project, set:
```properties
VITE_API_BASE_URL=http://localhost:8080
```
All API endpoints follow the agreed REST format documented in [`docs/API.md`](docs/API.md).
