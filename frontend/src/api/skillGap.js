import { apiClient } from "./client";

// GET /api/students/{studentId}/jobs/{jobId}/skill-gap
export function getSkillGap(studentId, jobId) {
  return apiClient.get(`/api/students/${studentId}/jobs/${jobId}/skill-gap`);
}