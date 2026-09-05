import { apiClient } from "./client";

export function getSkills() {
  return apiClient.get("/api/skills");
}

export function createSkill(data) {
  return apiClient.post("/api/skills", data);
}

export function updateSkill(id, data) {
  return apiClient.put(`/api/skills/${id}`, data);
}

export function deleteSkill(id) {
  return apiClient.delete(`/api/skills/${id}`);
}