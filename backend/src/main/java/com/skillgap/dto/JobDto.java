package com.skillgap.dto;

import java.sql.Timestamp;

public class JobDto {
    private int id;
    private String title;
    private String company;
    private String location;
    private Timestamp createdAt;

    public JobDto() {
    }

    public JobDto(int id, String title, String company, String location, Timestamp createdAt) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
