# Frontend Integration Contract (React + Tailwind + Lovable)

**Target Audience**: Frontend Engineering Team & Integration Architect  
**Technology**: React 18+, Tailwind CSS, Vite, Lovable  
**Backend Base URL**: `http://localhost:8080` (configured via `VITE_API_BASE_URL`)

---

## 1. Global Setup & Environment

The React frontend must define the backend API base URL in `.env`:
```properties
VITE_API_BASE_URL=http://localhost:8080
```

### Axios / Fetch Client Setup
All authenticated HTTP requests from the React application must automatically attach the token retrieved upon login:

```typescript
// Example apiClient.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sga_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 2. Authentication & Session Persistence

The frontend stores session state upon successful login:
```json
{
  