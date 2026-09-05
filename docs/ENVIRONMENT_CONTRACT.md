# Environment Contract Specification

This document details all configuration variables required across the Frontend, Backend, and Database environments.

---

## 1. Backend Environment Variables (`.env`)

The backend loads configuration via `com.skillgap.config.EnvLoader` from `.env` in the workspace root, falling back to system environment variables and then default values.

| Variable Name | Purpose | Example Value | Default | Required? | Sensitive? |
|---|---|---|---|---|---|
| `DB_URL` | JDBC Connection URL to MySQL | `jdbc:mysql://localhost:3306/skill_gap_analyzer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | `jdbc:mysql://localhost:3306/skill_gap_analyzer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | Optional (default used if omitted) | Non-sensitive (unless credentials embedded) |
| `DB_USER` | MySQL Username | `root` | `root` | Optional | Non-sensitive |
| `DB_PASSWORD` | MySQL User Password | `your_mysql_password` | `