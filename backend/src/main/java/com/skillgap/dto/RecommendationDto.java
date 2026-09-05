package com.skillgap.dto;

public class RecommendationDto {
    private int skillId;
    private String skillName;
    private int currentLevel;
    private int targetLevel;
    private int gap;
    private String priority; // "HIGH", "MEDIUM", "LOW"
    private String reason;

    public RecommendationDto() {
    }

    public RecommendationDto(int skillId, String skillName, int currentLevel, int targetLevel, int gap, String priority, String reason) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.currentLevel = currentLevel;
        this.targetLevel = targetLevel;
        this.gap = gap;
        this.priority = priority;
        this.reason = reason;
    }

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
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
}
