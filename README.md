# Employee / Student Skill Gap Analyzer

A full-stack enterprise competency and skill-gap recommendation platform built for hackathon demonstration.

- **Backend:** **Pure Java** (Standard Library HTTP Server, JDBC, MySQL, Token-based Auth) — *No Spring Boot, No Hibernate, No Framework overhead*.
- **Frontend:** **React 18 + Tailwind CSS + Lucide Icons + Vite**.
- **Database:** **MySQL 8.x**.

---

## 📁 Project Structure

```
EmployeeSkillGapAnalyzer/
├── start-all.bat                   ← ⭐ Double-click to launch BOTH backend & frontend!
├── start-backend.bat               ← Launch Java REST API backend only
├── start-frontend.bat              ← Launch React frontend only
│
├── backend/                        ← Pure Java REST API Backend (:8080)
│   ├── .env                        ← Database & server configuration
│   ├── .env.example                ← Environment template
│   ├── compile.bat                 ← Compile Java source files using javac
│   ├── run.bat                     ← Run backend with auto-compile
│   ├── lib/
│   │   └── mysql-connector-j.jar   ← MySQL JDBC Driver
│   ├── sql/
│   │   ├── schema.sql              ← Database schema & table definitions
│   │   └── seed.sql                ← Sample students, skills, jobs & demo data
│   ├── src/main/java/com/skillgap/ ← Pure Java Source Code (MVC Architecture)
│   └── target/classes/             ← Compiled bytecode (.class)
│
└── frontend/                       ← Modern React Application (:3000)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/                    ← REST client communicating with :8080
        ├── components/             ← Shared UI components & Navbar
        ├── context/                ← AuthContext (State & session management)
        ├── pages/                  ← Dashboard, Students, Jobs, SkillGap, etc.
        └── routes/                 ← Client-side routing
```

---

## 🚀 Quick Start (For Judges)

### Option A — One-Click Launch (Recommended)
Simply double-click:
```bat
start-all.bat
```
This automatically launches the Java Backend on **http://localhost:8080** and the Frontend on **http://localhost:3000**.

---

### Option B — Manual Launch

#### 1. Start the Java Backend:
```bash
cd backend
run.bat
```
*(Or manually: `java -cp "target\classes;lib\mysql-connector-j.jar" com.skillgap.Main`)*  
Backend runs on **http://localhost:8080**.

#### 2. Start the React Frontend:
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:3000**.

---

## 🗄️ Database Setup (First Time)

Import the provided SQL scripts into your MySQL server (using MySQL Workbench, DBeaver, or MySQL CLI):

1. `backend/sql/schema.sql` — Creates `skill_gap_analyzer` database and tables.
2. `backend/sql/seed.sql` — Populates initial demo users, skills, jobs, and mappings.

Update `backend/.env` with your local MySQL credentials:
```env
DB_URL=jdbc:mysql://localhost:3306/skill_gap_analyzer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USER=root
DB_PASSWORD=your_password_here
SERVER_PORT=8080
FRONTEND_ORIGIN=http://localhost:3000
AUTH_SECRET=skill-gap-analyzer-hackathon-secret-key-2026
```

---

## 🔑 Demo Credentials

| Role  | Email                 | Password   | Description |
|-------|-----------------------|------------|-------------|
| **Admin** | `admin@example.com`   | `password` | Full system access: manage students, jobs, skills |
| **Student** | `arun@example.com`    | `password` | View student profile, run skill gap against jobs |
| **Student** | `priya@example.com`   | `password` | Student view with high proficiency data |

> **Tip:** The Login page features **1-click Quick Demo buttons** to instantly sign in without typing credentials.

---

## 🌟 Key Features

1. **Pure Java REST Engine:**
   - Handcrafted HTTP Router & Request Dispatcher (`com.sun.net.httpserver`).
   - Pure JDBC repositories with prepared statements and transaction safety.
   - Deterministic skill-gap analyzer calculation and recommendation algorithm.
2. **Interactive Competency Analytics:**
   - Calculates weighted match score (%) between candidate skill profiles and job requirements.
   - Categorizes gaps into `MET`, `GAP` (partial), and `MISSING` skills with severity weighting.
3. **Actionable Recommendations:**
   - Generates ranked priority learning paths (`HIGH`, `MEDIUM`, `LOW`) for missing proficiencies.
4. **Role-Based Access Control:**
   - Secure token authentication with role authorization (`ADMIN` vs `USER`).
5. **Modern Responsive UI:**
   - Dashboard with live metrics, clean data tables, interactive skill badges, and status trackers.

---

## 📡 Core API Endpoints (Port 8080)

- `GET  /api/health` — Service health check
- `POST /api/auth/admin/login` — Admin authentication
- `POST /api/auth/user/login` — User/Student authentication
- `POST /api/auth/logout` — Revoke session token
- `GET  /api/dashboard/summary` — Analytics metrics and top skill gaps
- `GET  /api/students` — List students (Admin)
- `GET  /api/students/{id}` — Get student details
- `GET  /api/students/{id}/skills` — Get student skills
- `GET  /api/jobs` — List all open jobs
- `GET  /api/skills` — List skill taxonomy
- `GET  /api/students/{studentId}/jobs/{jobId}/skill-gap` — Calculate skill gap
- `GET  /api/students/{id}/recommendations` — Fetch learning recommendations
- `GET  /api/applications` — List applications
