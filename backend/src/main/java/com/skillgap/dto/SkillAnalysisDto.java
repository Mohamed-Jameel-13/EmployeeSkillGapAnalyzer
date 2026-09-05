package com.skillgap.dto;

public class SkillAnalysisDto {
    private int skillId;
    private String skillName;
    private int currentLevel;
    private int requiredLevel;
    private int gap;
    private boolean mandatory;
    private String status; // "MATCHED" or "GAP"

    public SkillAnalysisDto() {
    }

    public SkillAnalysisDto(int skillId, String skillName, int currentLevel, int requiredLevel, int gap, boolean mandatory, String status) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gap = gap;
        this.mandatory = mandatory;
        this.status = status;
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

    public int getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(int requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public int getGap() {
        return gap;
    }

    public void setGap(int gap) {
        this.gap = gap;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
