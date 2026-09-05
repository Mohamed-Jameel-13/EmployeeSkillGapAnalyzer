import { 
  MOCK_STUDENTS, 
  MOCK_SKILLS, 
  MOCK_JOBS, 
  MOCK_APPLICATIONS, 
  MOCK_DASHBOARD_STATS,
  calculateMockSkillGap,
  generateMockRecommendations
} from "../mocks/mockData";

// Persistent in-session local mock database
class LocalMockStore {
  constructor() {
    this.students = [...MOCK_STUDENTS];
    this.skills = [...MOCK_SKILLS];
    this.jobs = [...MOCK_JOBS];
    this.applications = [...MOCK_APPLICATIONS];
    this.stats = { ...MOCK_DASHBOARD_STATS };
  }

  getStudents() {
    return [...this.students];
  }

  getStudentById(id) {
    return this.students.find((s) => s.id === parseInt(id, 10)) || null;
  }

  createStudent(studentData) {
    const newStudent = {
      id: 100 + this.students.length + 1,
      name: studentData.name,
      email: studentData.email,
      role: studentData.role || "Software Engineer",
      skills: []
    };
    this.students.unshift(newStudent);
    this.stats.totalEmployees += 1;
    return newStudent;
  }

  getStudentSkills(id) {
    const student = this.getStudentById(id);
    return student ? [...(student.skills || [])] : [];
  }

  addOrUpdateStudentSkill(id, skillData) {
    const student = this.getStudentById(id);
    if (!student) throw new Error(`Student ${id} not found`);

    if (!student.skills) student.skills = [];

    const existingIdx = student.skills.findIndex(
      (s) => s.skillName.toLowerCase() === skillData.skillName.toLowerCase()
    );

    if (existingIdx >= 0) {
      student.skills[existingIdx].proficiency = parseInt(skillData.proficiency, 10);
    } else {
      student.skills.push({
        skillId: skillData.skillName.toLowerCase().replace(/\s+/g, ""),
        skillName: skillData.skillName,
        proficiency: parseInt(skillData.proficiency, 10)
      });
    }
    return student.skills;
  }

  getJobs() {
    return [...this.jobs];
  }

  getJobById(id) {
    return this.jobs.find((j) => j.id === parseInt(id, 10)) || null;
  }

  getJobSkills(id) {
    const job = this.getJobById(id);
    return job ? [...(job.skills || [])] : [];
  }

  getSkills() {
    return [...this.skills];
  }

  getSkillGap(studentId, jobId) {
    const student = this.getStudentById(studentId);
    const job = this.getJobById(jobId);
    if (!student || !job) {
      throw new Error("Invalid studentId or jobId for skill gap calculation");
    }
    return calculateMockSkillGap(student, job);
  }

  getRecommendations(studentId, jobId) {
    const gap = this.getSkillGap(studentId, jobId);
    return generateMockRecommendations(gap);
  }

  getApplications() {
    return [...this.applications];
  }

  createApplication(appData) {
    const student = this.getStudentById(appData.studentId);
    const job = this.getJobById(appData.jobId);
    const gap = student && job ? calculateMockSkillGap(student, job) : { overallMatch: 70 };

    const newApp = {
      id: this.applications.length + 1,
      studentId: parseInt(appData.studentId, 10),
      studentName: student ? student.name : "Candidate",
      studentEmail: student ? student.email : "",
      jobId: parseInt(appData.jobId, 10),
      jobTitle: job ? job.title : "Position",
      company: job ? job.company : "Company",
      matchPercentage: gap.overallMatch,
      status: "Applied",
      appliedDate: new Date().toISOString().split("T")[0]
    };
    this.applications.unshift(newApp);
    this.stats.totalApplications += 1;
    return newApp;
  }

  getDashboardStats() {
    return { ...this.stats };
  }
}

export const localMockStore = new LocalMockStore();