package com.skillgap.dto;

public class StudentSkillRequest {
    private Integer skillId;
    private Integer proficiency; // 1 to 5

    public StudentSkillRequest() {
    }

    public StudentSkillRequest(Integer skillId, Integer proficiency) {
        this.skillId = skillId;
        this.proficiency = proficiency;
    }

    public Integer getSkillId() {
        return skillId;
    }

    public void setSkillId(Integer skillId) {
        this.skillId = skillId;
    }

    public Integer getProficiency() {
        return proficiency;
    }

    public void setProficiency(Integer proficiency) {
        this.proficiency = proficiency;
    }
}
