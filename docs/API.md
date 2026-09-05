# Skill Gap Analyzer - REST API Specification

This document details all REST endpoints provided by the Pure Java backend for integration with the React + Tailwind frontend.

All requests and responses use **JSON** with **camelCase** property naming.
The base URL during development is: `http://localhost:8080`.

---

## Authentication & Headers

Protected endpoints require the standard HTTP Bearer token authorization header:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Standard Error Format

All error responses return a standardized JSON structure:
```json
{
  