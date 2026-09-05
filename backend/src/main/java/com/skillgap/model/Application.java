package com.skillgap.model;

import java.sql.Timestamp;

/**
 * Domain model representing a Job Application submitted by a Student.
 * Maps to MySQL table 'applications'.
 */
public class Application {
    private int applicationId;
    private int studentId;
    private int jobId;
    private int matchPercent;
    private String status; // 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'SELECTED'
    private Timestamp createdAt;

    // Joined fields for rich display in frontend
    private String studentName;
    private String studentEmail;
    private String jobTitle;
    private String jobCompany;
    private String jobLocation;

    public Application() {
    }

    public Application(int applicationId, int studentId, int jobId, int matchPercent, String status, Timestamp createdAt) {
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.jobId = jobId;
        this.matchPercent = matchPercent;
        this.status = status;
        this.createdAt = createdAt;
    }

    public int getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(int applicationId) {
        this.applicationId = applicationId;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public int getJobId() {
        return jobId;
    }

    public void setJobId(int jobId) {
        this.jobId = jobId;
    }

    public int getMatchPercent() {
        return matchPercent;
    }

    public void setMatchPercent(int matchPercent) {
        this.matchPercent = matchPercent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobCompany() {
        return jobCompany;
    }

    public void setJobCompany(String jobCompany) {
        this.jobCompany = jobCompany;
    }

    public String getJobLocation() {
        return jobLocation;
    }

    public void setJobLocation(String jobLocation) {
        this.jobLocation = jobLocation;
    }
}
