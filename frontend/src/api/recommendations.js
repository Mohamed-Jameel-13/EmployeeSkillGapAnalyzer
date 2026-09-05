import { apiClient } from "./client";

// GET /api/students/{studentId}/jobs/{jobId}/recommendations
export function getRecommendations(studentId, jobId) {
  return apiClient.get(`/api/students/${studentId}/jobs/${jobId}/recommendations`);
}