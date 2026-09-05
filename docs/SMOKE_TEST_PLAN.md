# Post-Integration Smoke Test Plan

This plan details the comprehensive end-to-end smoke test sequence to execute once the frontend and database packages are delivered and placed into the workspace.

---

## Smoke Test Step Sequence

### Step 1: Server Startup & Health
- **Action**: Launch backend via `java -cp ... com.skillgap.Main`.
- **Verify**: Console logs indicate server bound to port 8080 and database connectivity confirmed.
- **Request**: `GET http://localhost:8080/api/health`
- **Expected Result**: HTTP 200 `{