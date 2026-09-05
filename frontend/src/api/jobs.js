import { apiClient } from "./client";

export function getJobs() {
  return apiClient.get("/api/jobs");
}

export function getJobById(id) {
  return apiClient.get(`/api/jobs/${id}`);
}

export function getJobSkills(id) {
  return apiClient.get(`/api/jobs/${id}/skills`);
}

export function createJob(data) {
  return apiClient.post("/api/jobs", data);
}

export function updateJob(id, data) {
  return apiClient.put(`/api/jobs/${id}`, data);
}

export function deleteJob(id) {
  return apiClient.delete(`/api/jobs/${id}`);
}