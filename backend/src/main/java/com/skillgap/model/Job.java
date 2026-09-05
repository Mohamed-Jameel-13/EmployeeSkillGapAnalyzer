package com.skillgap.model;

import java.sql.Timestamp;

/**
 * Domain model representing a Job.
 * Maps to MySQL table 'jobs'.
 */
public class Job {
    private int jobId;
    private String title;
    private String company;
    private String location;
    private Timestamp createdAt;

    public Job() {
    }

    public Job(int jobId, String title, String company, String location, Timestamp createdAt) {
        this.jobId = jobId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.createdAt = createdAt;
    }

    public int getJobId() {
        return jobId;
    }

    public void setJobId(int jobId) {
        this.jobId = jobId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
