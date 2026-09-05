import { apiClient } from "./client";

// GET /api/dashboard/summary
export async function getDashboardStats() {
  return apiClient.get("/api/dashboard/summary");
}