package com.skillgap.model;

/**
 * Domain model representing a deterministic skill improvement recommendation.
 * Maps to MySQL table 'recommendations'.
 */
public class Recommendation {
    private int id;
    private int studentId;
    private int jobId;
    private int skillId;
    private String priority; // 'HIGH', 'MEDIUM', 'LOW'
    private String reason;

    // Joined / calculated fields
    private String skillName;
    private int currentLevel;
    private int targetLevel;
    private int gap;

    public Recommendation() {
    }

    public Recommendation(int id, int studentId, int jobId, int skillId, String priority, String reason) {
        this.id = id;
        this.studentId = studentId;
        this.jobId = jobId;
        this.skillId = skillId;
        this.priority = priority;
        this.reason = reason;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public int getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(int currentLevel) {
        this.currentLevel = currentLevel;
    }

    public int getTargetLevel() {
        return targetLevel;
    }

    public void setTargetLevel(int targetLevel) {
        this.targetLevel = targetLevel;
    }

    public int getGap() {
        return gap;
    }

    public void setGap(int gap) {
        this.gap = gap;
    }
}
