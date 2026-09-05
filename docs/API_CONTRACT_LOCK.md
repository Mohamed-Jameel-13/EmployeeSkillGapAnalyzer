# API Contract Lock - Integration Specification

**Status**: LOCKED BASELINE CONTRACT  
**Rule**: Any proposed change during frontend or database integration must be formally documented as a contract modification and justified by an integration requirement.

Base URL: `http://localhost:8080`  
Standard Content-Type: `application/json; charset=UTF-8`  
Standard Auth Header: `Authorization: Bearer <token>`

---

## Standard Error Response Schema
Returned for all 4xx and 5xx responses:
```json
{
  