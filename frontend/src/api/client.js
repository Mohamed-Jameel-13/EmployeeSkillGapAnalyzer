import { API_BASE_URL } from "./config";

// Central HTTP client — all calls go to the Pure Java REST backend.
// Attaches Bearer token from localStorage automatically.
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    // Token is stored after login as "skillbridge_token"
    return localStorage.getItem("skillbridge_token") || null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.message) errorMsg = errData.message;
        else if (errData.error) errorMsg = errData.error;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: "POST", body: JSON.stringify(data) });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: "PUT", body: JSON.stringify(data) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();