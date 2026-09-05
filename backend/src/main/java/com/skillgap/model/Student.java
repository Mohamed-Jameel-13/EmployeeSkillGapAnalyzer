package com.skillgap.model;

import java.sql.Timestamp;

/**
 * Domain model representing a Student or Admin user.
 * Maps to MySQL table 'students'.
 */
public class Student {
    private int studentId;
    private String name;
    private String email;
    private String passwordHash;
    private String role; // 'ADMIN' or 'USER'
    private Timestamp createdAt;

    public Student() {
    }

    public Student(int studentId, String name, String email, String passwordHash, String role, Timestamp createdAt) {
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
