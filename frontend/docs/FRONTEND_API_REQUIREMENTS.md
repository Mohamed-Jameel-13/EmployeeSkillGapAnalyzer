# FRONTEND REST API REQUIREMENTS & INTEGRATION SPECIFICATION

> **Target Backend:** Pure Java REST API (Plain Java HTTP Server / Servlets / Undertow / lightweight HTTP - NO Spring Boot, NO Spring MVC, NO Node.js)  
> **Target Database:** MySQL  
> **Frontend:** React + Tailwind CSS SPA  
> **API Base URL:** Configured via `VITE_API_BASE_URL` (Default: `http://localhost:8080`)  
> **Standard Request Headers:**  
> - `Content-Type: application/json`  
> - `Accept: application/json`

---

## 1. Proficiency Scale Standard (Non-Negotiable)

All skill proficiency fields throughout the database, backend calculations, and API responses must strictly adhere to the numerical integer scale:

| Value | Meaning | Description |
| :--- | :--- | :--- |
| **1** | Beginner | Elementary conceptual awareness |
| **2** | Basic | Foundational knowledge / academic practice |
| **3** | Intermediate | Practical working ability on tasks |
| **4** | Advanced | Production-grade fluency and problem solving |
| **5** | Expert | Deep mastery, architectural and optimization level |

*Note: Never accept or return string representations such as "Good" or "Average" for proficiency levels.*

---

## 2. API Contract Endpoints

### 2.1 Students / Employees

#### `POST /api/students`
- **Purpose:** Create a new student or employee candidate.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Arun",
    "email": "arun@example.com",
    "role": "Java Full Stack Developer"
  }
  ```
- **Validation Rules:**
  - `name`: Required, non-empty string.
  - `email`: Required, valid email format.
  - `role`: Optional string.
- **Expected Response (`201 Created`):**
  ```json
  {
    "id": 101,
    "name": "Arun",
    "email": "arun@example.com",
    "role": "Java Full Stack Developer"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"error": "Name and valid email are required"}`

---

#### `GET /api/students`
- **Purpose:** Retrieve list of registered students/employees.
- **Status:** *REQUIRES BACKEND CONTRACT CONFIRMATION* (Standard collection endpoint)
- **Expected Response (`200 OK`):**
  ```json
  [
    {
      "id": 101,
      "name": "Arun",
      "email": "arun@example.com",
      "role": "Java Full Stack Developer"
    }
  ]
  ```

---

#### `GET /api/students/{id}`
- **Purpose:** Retrieve single student/employee profile details.
- **Expected Response (`200 OK`):**
  ```json
  {
    "id": 101,
    "name": "Arun",
    "email": "arun@example.com",
    "role": "Java Full Stack Developer"
  }
  ```
- **Error Response:** `404 Not Found` if student ID does not exist.

---

### 2.2 Student Skills Management

#### `GET /api/students/{id}/skills`
- **Purpose:** Retrieve current declared skills for a student/employee.
- **Path Parameter:** `id` (integer) - Student ID.
- **Expected Response (`200 OK`):**
  ```json
  [
    {
      "skillId": "java",
      "skillName": "Java",
      "proficiency": 4
    },
    {
      "skillId": "mysql",
      "skillName": "MySQL",
      "proficiency": 4
    },
    {
      "skillId": "python",
      "skillName": "Python",
      "proficiency": 3
    },
    {
      "skillId": "react",
      "skillName": "React",
      "proficiency": 2
    },
    {
      "skillId": "aws",
      "skillName": "AWS",
      "proficiency": 1
    }
  ]
  ```

---

#### `POST /api/students/{id}/skills`
- **Purpose:** Add or update a student's skill and proficiency level.
- **CRITICAL CONTRACT NOTE:** The specification explicitly defines **`POST`** (not `PUT` or `PATCH`) for this endpoint. The Java backend must handle creating or upserting the skill record under this POST route.
- **Request Body:**
  ```json
  {
    "skillName": "Spring Boot",
    "proficiency": 4
  }
  ```
- **Validation Rules:**
  - `skillName`: Required string.
  - `proficiency`: Required integer between `1` and `5`.
- **Expected Response (`200 OK` or `201 Created`):**
  ```json
  [
    {
      "skillId": "springboot",
      "skillName": "Spring Boot",
      "proficiency": 4
    }
  ]
  ```

---

### 2.3 Jobs and Required Skills

#### `GET /api/jobs`
- **Purpose:** Retrieve list of active job postings.
- **Status:** *REQUIRES BACKEND CONTRACT CONFIRMATION* (Standard collection endpoint)
- **Expected Response (`200 OK`):**
  ```json
  [
    {
      "id": 501,
      "title": "Java Full Stack Developer",
      "company": "ABC Technologies",
      "location": "Bengaluru (Hybrid)",
      "description": "Develop enterprise Java services and React user interfaces."
    }
  ]
  ```

---

#### `GET /api/jobs/{id}`
- **Purpose:** Get full details for a target job.
- **Path Parameter:** `id` (integer) - Job ID.
- **Expected Response (`200 OK`):**
  ```json
  {
    "id": 501,
    "title": "Java Full Stack Developer",
    "company": "ABC Technologies",
    "location": "Bengaluru (Hybrid)",
    "description": "Develop enterprise Java services and React user interfaces."
  }
  ```

---

#### `GET /api/jobs/{id}/skills`
- **Purpose:** Get required skills, proficiency threshold (1–5), and mandatory status for a job.
- **Path Parameter:** `id` (integer) - Job ID.
- **Expected Response (`200 OK`):**
  ```json
  [
    {
      "skillId": "java",
      "skillName": "Java",
      "requiredProficiency": 4,
      "mandatory": true
    },
    {
      "skillId": "springboot",
      "skillName": "Spring Boot",
      "requiredProficiency": 4,
      "mandatory": true
    },
    {
      "skillId": "react",
      "skillName": "React",
      "requiredProficiency": 3,
      "mandatory": true
    },
    {
      "skillId": "mysql",
      "skillName": "MySQL",
      "requiredProficiency": 3,
      "mandatory": true
    },
    {
      "skillId": "aws",
      "skillName": "AWS",
      "requiredProficiency": 2,
      "mandatory": false
    }
  ]
  ```

---

### 2.4 Skill Gap Analysis Engine

#### `GET /api/students/{studentId}/jobs/{jobId}/skill-gap`
- **Purpose:** Perform side-by-side skill gap diagnosis comparing student competencies against job requirements.
- **Path Parameters:**
  - `studentId` (integer): ID of the student/employee.
  - `jobId` (integer): ID of the target job.
- **Calculation Rules Enforced by Backend:**
  $$\text{gap} = \max(\text{required\_level} - \text{current\_level}, 0)$$
  - If $\text{current\_level} \ge \text{required\_level} \implies \text{status} = \text{"MATCHED"}$
  - If $\text{current\_level} < \text{required\_level} \implies \text{status} = \text{"GAP"}$
- **Expected Response (`200 OK`):**
  ```json
  {
    "studentId": 101,
    "studentName": "Arun",
    "jobId": 501,
    "jobTitle": "Java Full Stack Developer",
    "company": "ABC Technologies",
    "overallMatch": 72,
    "breakdown": [
      {
        "skill": "Java",
        "current": 4,
        "required": 4,
        "gap": 0,
        "status": "MATCHED",
        "mandatory": true
      },
      {
        "skill": "MySQL",
        "current": 4,
        "required": 3,
        "gap": 0,
        "status": "MATCHED",
        "mandatory": true
      },
      {
        "skill": "Spring Boot",
        "current": 2,
        "required": 4,
        "gap": 2,
        "status": "GAP",
        "mandatory": true
      },
      {
        "skill": "React",
        "current": 2,
        "required": 3,
        "gap": 1,
        "status": "GAP",
        "mandatory": true
      },
      {
        "skill": "AWS",
        "current": 1,
        "required": 2,
        "gap": 1,
        "status": "GAP",
        "mandatory": false
      }
    ]
  }
  ```

---

### 2.5 Recommendations Engine

#### `GET /api/students/{studentId}/jobs/{jobId}/recommendations`
- **Purpose:** Retrieve priority-sorted learning recommendations generated by the backend engine for missing/under-proficient skills.
- **Path Parameters:** `studentId` (integer), `jobId` (integer).
- **Expected Response (`200 OK`):**
  ```json
  [
    {
      "priority": "HIGH PRIORITY",
      "skill": "Spring Boot",
      "current": 2,
      "target": 4,
      "gap": 2,
      "reason": "Mandatory job requirement"
    },
    {
      "priority": "MEDIUM PRIORITY",
      "skill": "React",
      "current": 2,
      "target": 3,
      "gap": 1,
      "reason": "Required proficiency gap"
    },
    {
      "priority": "MEDIUM PRIORITY",
      "skill": "AWS",
      "current": 1,
      "target": 2,
      "gap": 1,
      "reason": "Required supporting skill"
    }
  ]
  ```

---

### 2.6 Applications

#### `POST /api/applications`
- **Purpose:** Submit candidate application for a target position.
- **Request Body:**
  ```json
  {
    "studentId": 101,
    "jobId": 501
  }
  ```
- **Expected Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "studentId": 101,
    "jobId": 501,
    "matchPercentage": 72,
    "status": "Applied",
    "appliedDate": "2026-09-05"
  }
  ```

#### `GET /api/applications`
- **Purpose:** Retrieve all candidate applications.
- **Status:** *REQUIRES BACKEND CONTRACT CONFIRMATION* (Standard collection endpoint)
- **Possible Statuses:**
  - `"Applied"`
  - `"Under Review"`
  - `"Shortlisted"`
  - `"Selected"`
  - `"Rejected"`
- **Expected Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "studentId": 101,
      "studentName": "Arun",
      "jobId": 501,
      "jobTitle": "Java Full Stack Developer",
      "company": "ABC Technologies",
      "matchPercentage": 72,
      "status": "Applied",
      "appliedDate": "2026-09-05"
    }
  ]
  ```

---

### 2.7 Dashboard Aggregation

#### `GET /api/dashboard/stats`
- **Purpose:** Summary KPIs for executive dashboard.
- **Status:** *REQUIRES BACKEND CONTRACT CONFIRMATION*
- **Expected Response (`200 OK`):**
  ```json
  {
    "totalEmployees": 250,
    "totalJobs": 120,
    "totalApplications": 45,
    "averageSkillMatch": 74,
    "topSkillGaps": [
      { "skill": "Spring Boot", "gapCount": 84, "percentage": 68 },
      { "skill": "React", "gapCount": 65, "percentage": 52 },
      { "skill": "AWS", "gapCount": 58, "percentage": 46 },
      { "skill": "Docker", "gapCount": 42, "percentage": 34 }
    ]
  }
  ```