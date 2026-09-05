import { apiClient } from "./client";

export function getStudents() {
  return apiClient.get("/api/students");
}

export function getStudentById(id) {
  return apiClient.get(`/api/students/${id}`);
}

export function createStudent(data) {
  return apiClient.post("/api/students", data);
}

export function updateStudent(id, data) {
  return apiClient.put(`/api/students/${id}`, data);
}

export function getStudentSkills(id) {
  return apiClient.get(`/api/students/${id}/skills`);
}

export function addOrUpdateStudentSkill(id, skillData) {
  return apiClient.post(`/api/students/${id}/skills`, skillData);
}

export function deleteStudentSkill(studentId, skillId) {
  return apiClient.delete(`/api/students/${studentId}/skills/${skillId}`);
}

export function deleteStudent(id) {
  return apiClient.delete(`/api/students/${id}`);
}