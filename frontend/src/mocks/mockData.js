// Mock data strictly matching the Hackathon specification & design references

export const MOCK_STUDENTS = [
  {
    id: 101,
    name: "Arun",
    email: "arun@example.com",
    role: "Java Full Stack Developer",
    skills: [
      { skillId: "java", skillName: "Java", proficiency: 4 },
      { skillId: "mysql", skillName: "MySQL", proficiency: 4 },
      { skillId: "python", skillName: "Python", proficiency: 3 },
      { skillId: "springboot", skillName: "Spring Boot", proficiency: 2 },
      { skillId: "react", skillName: "React", proficiency: 2 },
      { skillId: "aws", skillName: "AWS", proficiency: 1 }
    ]
  },
  {
    id: 102,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Backend Developer",
    skills: [
      { skillId: "java", skillName: "Java", proficiency: 4 },
      { skillId: "springboot", skillName: "Spring Boot", proficiency: 3 },
      { skillId: "mysql", skillName: "MySQL", proficiency: 4 },
      { skillId: "docker", skillName: "Docker", proficiency: 3 }
    ]
  },
  {
    id: 103,
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    role: "Cloud DevOps Engineer",
    skills: [
      { skillId: "aws", skillName: "AWS", proficiency: 4 },
      { skillId: "docker", skillName: "Docker", proficiency: 4 },
      { skillId: "python", skillName: "Python", proficiency: 3 },
      { skillId: "mysql", skillName: "MySQL", proficiency: 3 }
    ]
  },
  {
    id: 104,
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    role: "Frontend Developer",
    skills: [
      { skillId: "react", skillName: "React", proficiency: 4 },
      { skillId: "javascript", skillName: "JavaScript", proficiency: 4 },
      { skillId: "python", skillName: "Python", proficiency: 2 }
    ]
  }
];

export const MOCK_SKILLS = [
  { id: "java", name: "Java", category: "Backend" },
  { id: "springboot", name: "Spring Boot", category: "Backend" },
  { id: "react", name: "React", category: "Frontend" },
  { id: "mysql", name: "MySQL", category: "Database" },
  { id: "aws", name: "AWS", category: "Cloud & DevOps" },
  { id: "docker", name: "Docker", category: "Cloud & DevOps" },
  { id: "python", name: "Python", category: "General / AI" },
  { id: "javascript", name: "JavaScript", category: "Frontend" }
];

export const MOCK_JOBS = [
  {
    id: 501,
    title: "Java Full Stack Developer",
    company: "ABC Technologies",
    location: "Bengaluru, India (Hybrid)",
    description: "Seeking a passionate Java Full Stack Developer to build enterprise web applications with clean microservices and modern responsive frontends.",
    skills: [
      { skillId: "java", skillName: "Java", requiredProficiency: 4, mandatory: true },
      { skillId: "springboot", skillName: "Spring Boot", requiredProficiency: 4, mandatory: true },
      { skillId: "react", skillName: "React", requiredProficiency: 3, mandatory: true },
      { skillId: "mysql", skillName: "MySQL", requiredProficiency: 3, mandatory: true },
      { skillId: "aws", skillName: "AWS", requiredProficiency: 2, mandatory: false }
    ]
  },
  {
    id: 502,
    title: "Cloud Backend Engineer",
    company: "CloudMatrix Systems",
    location: "Hyderabad, India (Remote)",
    description: "Design high-throughput APIs, deploy containerized workloads, and maintain resilient relational databases on AWS.",
    skills: [
      { skillId: "java", skillName: "Java", requiredProficiency: 4, mandatory: true },
      { skillId: "springboot", skillName: "Spring Boot", requiredProficiency: 4, mandatory: true },
      { skillId: "aws", skillName: "AWS", requiredProficiency: 3, mandatory: true },
      { skillId: "docker", skillName: "Docker", requiredProficiency: 3, mandatory: false },
      { skillId: "mysql", skillName: "MySQL", requiredProficiency: 3, mandatory: true }
    ]
  },
  {
    id: 503,
    title: "React Frontend Engineer",
    company: "PixelCraft Labs",
    location: "Pune, India (Hybrid)",
    description: "Translate complex mockups into pixel-perfect, accessible React dashboards and collaborate with REST API developers.",
    skills: [
      { skillId: "react", skillName: "React", requiredProficiency: 3, mandatory: true },
      { skillId: "javascript", skillName: "JavaScript", requiredProficiency: 3, mandatory: true },
      { skillId: "mysql", skillName: "MySQL", requiredProficiency: 2, mandatory: false }
    ]
  }
];

export const MOCK_APPLICATIONS = [
  {
    id: 1,
    studentId: 101,
    studentName: "Arun",
    studentEmail: "arun@example.com",
    jobId: 501,
    jobTitle: "Java Full Stack Developer",
    company: "ABC Technologies",
    matchPercentage: 72,
    status: "Applied",
    appliedDate: "2026-09-02"
  },
  {
    id: 2,
    studentId: 102,
    studentName: "Priya Sharma",
    studentEmail: "priya.sharma@example.com",
    jobId: 501,
    jobTitle: "Java Full Stack Developer",
    company: "ABC Technologies",
    matchPercentage: 78,
    status: "Under Review",
    appliedDate: "2026-09-03"
  },
  {
    id: 3,
    studentId: 103,
    studentName: "Rahul Verma",
    studentEmail: "rahul.verma@example.com",
    jobId: 502,
    jobTitle: "Cloud Backend Engineer",
    company: "CloudMatrix Systems",
    matchPercentage: 88,
    status: "Shortlisted",
    appliedDate: "2026-09-01"
  }
];

export const MOCK_DASHBOARD_STATS = {
  totalEmployees: 250,
  totalJobs: 120,
  totalApplications: 45,
  averageSkillMatch: 74,
  topSkillGaps: [
    { skill: "Spring Boot", gapCount: 84, percentage: 68 },
    { skill: "React", gapCount: 65, percentage: 52 },
    { skill: "AWS", gapCount: 58, percentage: 46 },
    { skill: "Docker", gapCount: 42, percentage: 34 }
  ]
};

// Official skill gap calculation rule from specification:
// gap = max(required_level - current_level, 0)
// if current_level >= required_level -> MATCHED
// if current_level < required_level -> GAP
export function calculateMockSkillGap(student, job) {
  const studentSkillMap = new Map();
  (student.skills || []).forEach((s) => {
    studentSkillMap.set(s.skillName.toLowerCase(), s.proficiency);
  });

  const breakdown = (job.skills || []).map((req) => {
    const current = studentSkillMap.get(req.skillName.toLowerCase()) || 0;
    const required = req.requiredProficiency;
    const gap = Math.max(required - current, 0);
    const status = current >= required ? "MATCHED" : "GAP";

    return {
      skill: req.skillName,
      current,
      required,
      gap,
      status,
      mandatory: req.mandatory
    };
  });

  // Calculate overall match percentage
  let matchedPoints = 0;
  let totalRequiredPoints = 0;

  breakdown.forEach((item) => {
    const weight = item.mandatory ? 1.5 : 1.0;
    totalRequiredPoints += item.required * weight;
    matchedPoints += Math.min(item.current, item.required) * weight;
  });

  const overallMatch = totalRequiredPoints > 0 
    ? Math.round((matchedPoints / totalRequiredPoints) * 100) 
    : 100;

  return {
    studentId: student.id,
    studentName: student.name,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    overallMatch: overallMatch,
    breakdown
  };
}

export function generateMockRecommendations(skillGap) {
  const recommendations = [];

  skillGap.breakdown.forEach((item) => {
    if (item.status === "GAP") {
      let priority = "LOW PRIORITY";
      let reason = "Recommended skill upgrade";

      if (item.mandatory && item.gap >= 2) {
        priority = "HIGH PRIORITY";
        reason = "Mandatory job requirement";
      } else if (item.mandatory && item.gap === 1) {
        priority = "MEDIUM PRIORITY";
        reason = "Required proficiency gap";
      } else {
        priority = "MEDIUM PRIORITY";
        reason = "Required supporting skill";
      }

      recommendations.push({
        priority,
        skill: item.skill,
        current: item.current,
        target: item.required,
        gap: item.gap,
        reason
      });
    }
  });

  // Sort: HIGH PRIORITY first, then MEDIUM, then LOW
  const priorityOrder = { "HIGH PRIORITY": 1, "MEDIUM PRIORITY": 2, "LOW PRIORITY": 3 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}