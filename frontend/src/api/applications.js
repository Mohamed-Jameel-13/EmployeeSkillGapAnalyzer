import { apiClient } from "./client";

export function getApplications() {
  return apiClient.get("/api/applications");
}

export function getApplicationById(id) {
  return apiClient.get(`/api/applications/${id}`);
}

export function createApplication(data) {
  // POST /api/applications  body: { studentId, jobId }
  return apiClient.post("/api/applications", data);
}

export function updateApplicationStatus(id, status) {
  // PUT /api/applications/{id}/status  body: { status }
  return apiClient.put(`/api/applications/${id}/status`, { status });
}