package com.skillgap.dto;

public class JobSkillRequest {
    private Integer skillId;
    private String skillName;
    private Integer requiredLevel;
    private Boolean mandatory;

    public JobSkillRequest() {
    }

    public JobSkillRequest(Integer skillId, Integer requiredLevel, Boolean mandatory) {
        this.skillId = skillId;
        this.requiredLevel = requiredLevel;
        this.mandatory = mandatory;
    }

    public JobSkillRequest(Integer skillId, String skillName, Integer requiredLevel, Boolean mandatory) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.requiredLevel = requiredLevel;
        this.mandatory = mandatory;
    }

    public Integer getSkillId() {
        return skillId;
    }

    public void setSkillId(Integer skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public Boolean getMandatory() {
        return mandatory;
    }

    public void setMandatory(Boolean mandatory) {
        this.mandatory = mandatory;
    }
}
