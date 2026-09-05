package com.skillgap.dto;

public class JobSkillDto {
    private int id;
    private int skillId;
    private String skillName;
    private int requiredLevel;
    private boolean mandatory;

    public JobSkillDto() {
    }

    public JobSkillDto(int id, int skillId, String skillName, int requiredLevel, boolean mandatory) {
        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.requiredLevel = requiredLevel;
        this.mandatory = mandatory;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public int getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(int requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }
}
