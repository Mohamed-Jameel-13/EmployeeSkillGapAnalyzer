# Failure Scenarios & Edge Case Resilience Matrix

This document defines how failure scenarios, edge cases, and invalid inputs must be handled by both the Backend and Frontend to ensure production-grade stability during hackathon judging.

---

## 1. Authentication & Authorization Failures

| Scenario | Input / Action | Backend Behavior | HTTP Code | Expected Frontend Handling |
|---|---|---|---|---|
| **Invalid Credentials** | Wrong password or nonexistent email | Returns JSON `{status: 401, error: 